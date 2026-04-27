import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type ClientProfile } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';
import { type PortfolioAsset } from '../data/MockData';

export interface Operation {
  date: string;
  clientId: string;
  type: string;
  ticker: string;
  assetType: string;
  shares: number;
  price: number;
  commission: number;
  currency: string;
  totalMXN: number;
}

export interface ClientWithPortfolio extends ClientProfile {
  portfolio: PortfolioAsset[];
}

interface PortfolioContextType {
  clientPortfolio: PortfolioAsset[];
  clientOperations: Operation[];
  totalNetWorthUSD: number;
  totalNetWorthMXN: number;
  allClients: ClientWithPortfolio[];
  allOperations: Operation[];
  isLoading: boolean;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { exchangeRate } = useCurrency();
  const [clientPortfolio, setClientPortfolio] = useState<PortfolioAsset[]>([]);
  const [clientOperations, setClientOperations] = useState<Operation[]>([]);
  const [allClients, setAllClients] = useState<ClientWithPortfolio[]>([]);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map CSV row to PortfolioAsset
  const mapRowToAsset = (row: any): PortfolioAsset => {
    const findKey = (keys: string[]) => {
      const found = Object.keys(row).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
      return found ? row[found] : '';
    };

    const rawType = findKey(['Type', 'Tipo', 'Category', 'AssetType']);
    const typeMapping: Record<string, any> = {
      'stocks': 'Renta Variable', 'acciones': 'Renta Variable', 'etfs': 'Renta Variable',
      'fibras': 'Renta Variable', 'fibra': 'Renta Variable', 'commodities': 'Renta Variable',
      'Renta Fija': 'Renta Fija', 'renta fija': 'Renta Fija', 'cetes': 'Renta Fija',
      'crypto': 'Criptomonedas', 'cripto': 'Criptomonedas', 'criptomonedas': 'Criptomonedas',
      'forex': 'Divisas', 'divisas': 'Divisas', 'cash': 'Divisas', 'liquidez': 'Divisas'
    };

    const safeParseFloat = (val: string) => {
      // Remove everything except digits, minus signs, and decimal points (e.g., strips '$', ',', '€', '#N/A')
      const cleaned = (val || '0').toString().replace(/[^0-9.-]+/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      ticker: findKey(['Ticker', 'Symbol', 'Activo']),
      type: typeMapping[rawType.toLowerCase()] || 'Renta Variable',
      sharesOwned: safeParseFloat(findKey(['Shares_Owned', 'Shares', 'Titulos', 'Cantidad'])),
      avgPurchasePriceMXN: safeParseFloat(findKey(['Avg_Price_MXN', 'Costo_MXN', 'Precio_Promedio_MXN'])),
      avgPurchasePriceUSD: safeParseFloat(findKey(['Avg_Price_USD', 'Costo_USD', 'Precio_Promedio_USD'])),
      realTimePrice: safeParseFloat(findKey(['Live_Price', 'Real_Time_Price', 'Precio_Mercado', 'Price'])),
      nativeCurrency: (findKey(['Currency', 'Moneda', 'Divisa']) as any) || 'USD',
      logoUrl: findKey(['LogoURL', 'Logo_URL', 'Logo']) || undefined
    };
  };

  // 1. Sync All Clients & Portfolios
  const refreshPortfolio = async () => {
    setIsLoading(true);
    try {
      if (!SHEET_URLS.CLIENTS_DATA) {
        setIsLoading(false);
        return;
      }

      const portfolioSources = [
        SHEET_URLS.PORTFOLIO_SUMMARY,
        SHEET_URLS.SUMMARY_STOCKS,
        SHEET_URLS.SUMMARY_ETFS,
        SHEET_URLS.SUMMARY_CRYPTO,
        SHEET_URLS.SUMMARY_FIXED_INCOME,
        SHEET_URLS.SUMMARY_FIBRAS,
        SHEET_URLS.SUMMARY_COMMODITIES,
        SHEET_URLS.SUMMARY_FOREX
      ].filter(url => url && url.trim() !== '');

      const [clientsRaw, opsRaw, ...portfolioRaws] = await Promise.all([
        fetchCsvData(SHEET_URLS.CLIENTS_DATA),
        fetchCsvData(SHEET_URLS.OPERACIONES),
        ...portfolioSources.map(url => fetchCsvData(url))
      ]);

      const combinedPortfolioRaw = portfolioRaws.flat();

      // Map Operations
      const mappedOperations: Operation[] = (opsRaw || []).map((row: any) => ({
        date: row.Fecha || row.Date || '',
        clientId: row.Cliente_ID || row.ClientID || '',
        type: row.Tipo_Operación || row.Type || '',
        ticker: row.Ticker || row.Symbol || '',
        assetType: row.Tipo_Activo || row.AssetType || '',
        shares: parseFloat(row.Cantidad || row.Shares || 0),
        price: parseFloat(row.Precio || row.Price || 0),
        commission: parseFloat(row.Comisión || row.Comision || 0),
        currency: row.Moneda || row.Currency || 'USD',
        totalMXN: parseFloat((row.Total_MXN || '0').toString().replace(/[^0-9.-]+/g, ''))
      }));

      setAllOperations(mappedOperations);

      // Map Portfolios
      const portfolioByClient: Record<string, PortfolioAsset[]> = {};
      combinedPortfolioRaw.forEach((row: any) => {
        const clientId = row.ClientID || row.clientid || row.ID || row.id;
        if (clientId) {
          if (!portfolioByClient[clientId]) portfolioByClient[clientId] = [];
          const asset = mapRowToAsset(row);
          if (asset.ticker && asset.sharesOwned > 0) {
            portfolioByClient[clientId].push(asset);
          }
        }
      });

      // Map Clients
      const mappedClients: ClientWithPortfolio[] = clientsRaw.map((row: any) => {
        const id = row.ID || row.id || '';
        return {
          id,
          name: row.Nombre || row.name || '',
          role: (row.Role || row.role || 'client') as 'admin' | 'client',
          email: row.Email || row.email || '',
          phone: row.Telefono || row.phone || '',
          portfolio: portfolioByClient[id] || []
        };
      }).filter((c: any) => c.id);

      setAllClients(mappedClients);

      // Update current user's specific portfolio
      if (user) {
        setClientPortfolio(portfolioByClient[user.id] || []);
        setClientOperations(mappedOperations.filter(op => op.clientId === user.id));
      }
    } catch (error) {
      console.error('Error syncing portfolios:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshPortfolio();
  }, [user]);

  const totalNetWorthMXN = clientPortfolio.reduce((acc, asset) => {
    const currentPriceMXN = asset.nativeCurrency === 'USD' 
      ? asset.realTimePrice * exchangeRate 
      : asset.realTimePrice;
    return acc + (asset.sharesOwned * currentPriceMXN);
  }, 0);

  const totalNetWorthUSD = totalNetWorthMXN / exchangeRate;

  return (
    <PortfolioContext.Provider value={{ 
      clientPortfolio, 
      clientOperations,
      totalNetWorthUSD, 
      totalNetWorthMXN, 
      allClients, 
      allOperations,
      isLoading, 
      refreshPortfolio 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
