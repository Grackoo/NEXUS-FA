import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type ClientProfile } from './AuthContext';
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
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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
      'fixed income': 'Fixed Income', 'renta fija': 'Fixed Income',
      'cetes': 'Fixed Income', 'crypto': 'Crypto', 'cripto': 'Crypto',
      'fibras': 'FIBRAs', 'fibra': 'FIBRAs', 'commodities': 'Commodities',
      'forex': 'Forex', 'divisas': 'Forex'
    };

    return {
      ticker: findKey(['Ticker', 'Symbol', 'Activo']),
      type: typeMapping[rawType.toLowerCase()] || 'Stocks',
      sharesOwned: parseFloat(findKey(['Shares_Owned', 'Shares', 'Titulos', 'Cantidad']) || '0'),
      avgPurchasePriceMXN: parseFloat(findKey(['Avg_Price_MXN', 'Costo_MXN', 'Precio_Promedio_MXN']) || '0'),
      avgPurchasePriceUSD: parseFloat(findKey(['Avg_Price_USD', 'Costo_USD', 'Precio_Promedio_USD']) || '0'),
      realTimePrice: parseFloat(findKey(['Live_Price', 'Real_Time_Price', 'Precio_Mercado', 'Price']) || '0'),
      nativeCurrency: (findKey(['Currency', 'Moneda', 'Divisa']) as any) || 'USD'
    };
  };

  // 1. Sync All Clients & Portfolios
  useEffect(() => {
    const syncData = async () => {
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
    syncData();
  }, [user]);

  const totalNetWorthUSD = clientPortfolio.reduce((acc, asset) => {
    const value = asset.sharesOwned * (asset.nativeCurrency === 'USD' ? asset.realTimePrice : asset.realTimePrice / 16.5);
    return acc + value;
  }, 0);

  const totalNetWorthMXN = totalNetWorthUSD * 16.5;

  return (
    <PortfolioContext.Provider value={{ clientPortfolio, totalNetWorthUSD, totalNetWorthMXN, allClients, isLoading }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
