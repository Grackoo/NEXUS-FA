import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type ClientProfile } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';
import { type PortfolioAsset } from '../data/MockData';

export interface ClientWithPortfolio extends ClientProfile {
  portfolio: PortfolioAsset[];
}

interface PortfolioContextType {
  clientPortfolio: PortfolioAsset[];
  totalNetWorthUSD: number;
  totalNetWorthMXN: number;
  allClients: ClientWithPortfolio[]; // Enriched with portfolio data
  isLoading: boolean;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { exchangeRate } = useCurrency();
  const [clientPortfolio, setClientPortfolio] = useState<PortfolioAsset[]>([]);
  const [allClients, setAllClients] = useState<ClientWithPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map CSV row to PortfolioAsset
  const mapRowToAsset = (row: any): PortfolioAsset => {
    const findKey = (keys: string[]) => {
      const found = Object.keys(row).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
      return found ? row[found] : '';
    };

    const rawType = findKey(['Type', 'Tipo', 'Category', 'AssetType']);
    const typeMapping: Record<string, any> = {
      'stocks': 'Stocks', 'acciones': 'Stocks', 'etfs': 'ETFs',
      'Renta Fija': 'Fixed Income', 'renta fija': 'Fixed Income',
      'cetes': 'Fixed Income', 'crypto': 'Crypto', 'cripto': 'Crypto',
      'fibras': 'FIBRAs', 'fibra': 'FIBRAs', 'commodities': 'Commodities',
      'forex': 'Forex', 'divisas': 'Forex'
    };

    const safeParseFloat = (val: string) => {
      // Remove everything except digits, minus signs, and decimal points (e.g., strips '$', ',', '€', '#N/A')
      const cleaned = (val || '0').toString().replace(/[^0-9.-]+/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      ticker: findKey(['Ticker', 'Symbol', 'Activo']),
      type: typeMapping[rawType.toLowerCase()] || 'Stocks',
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

      const [clientsRaw, ...portfolioRaws] = await Promise.all([
        fetchCsvData(SHEET_URLS.CLIENTS_DATA),
        ...portfolioSources.map(url => fetchCsvData(url))
      ]);

      const combinedPortfolioRaw = portfolioRaws.flat();

      // Map Portfolios
      const portfolioByClient: Record<string, PortfolioAsset[]> = {};
      combinedPortfolioRaw.forEach(row => {
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
      const mappedClients: ClientWithPortfolio[] = clientsRaw.map(row => {
        const id = row.ID || row.id || '';
        return {
          id,
          name: row.Nombre || row.name || '',
          role: (row.Role || row.role || 'client') as 'admin' | 'client',
          email: row.Email || row.email || '',
          phone: row.Telefono || row.phone || '',
          portfolio: portfolioByClient[id] || []
        };
      }).filter(c => c.id);

      setAllClients(mappedClients);

      // Update current user's specific portfolio
      if (user) {
        setClientPortfolio(portfolioByClient[user.id] || []);
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
    return acc + (asset.sharesOwned * asset.realTimePrice); // realTimePrice is now explicitly MXN
  }, 0);

  const totalNetWorthUSD = totalNetWorthMXN / exchangeRate;

  return (
    <PortfolioContext.Provider value={{ clientPortfolio, totalNetWorthUSD, totalNetWorthMXN, allClients, isLoading, refreshPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
