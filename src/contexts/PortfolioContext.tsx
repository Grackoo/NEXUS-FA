import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_CLIENTS, MOCK_OPERACIONES, type Operation, type PortfolioAsset, type Client } from '../data/MockData';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';

interface PortfolioContextType {
  clientPortfolio: PortfolioAsset[];
  totalNetWorthUSD: number;
  totalNetWorthMXN: number;
  addOperation: (op: Operation) => void;
  allClients: Client[]; // For admin view
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clientPortfolio, setClientPortfolio] = useState<PortfolioAsset[]>([]);
  const [allClients] = useState<Client[]>(MOCK_CLIENTS);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (user) {
        if (SHEET_URLS.PORTFOLIO_SUMMARY) {
          const data = await fetchCsvData(SHEET_URLS.PORTFOLIO_SUMMARY);
          // Map CSV columns to PortfolioAsset interface
          // Expecting: Ticker, Shares_Owned, Avg_Price_MXN, Avg_Price_USD, Live_Price, Currency
          const mapped: PortfolioAsset[] = data.map(row => {
            // Robust mapping: find key regardless of case or spaces
            const findKey = (keys: string[]) => {
              const found = Object.keys(row).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
              return found ? row[found] : '';
            };

            return {
              ticker: findKey(['Ticker', 'Symbol', 'Activo']),
              type: (findKey(['Type', 'Tipo', 'Category']) as any) || 'Stocks',
              sharesOwned: parseFloat(findKey(['Shares_Owned', 'Shares', 'Titulos', 'Cantidad']) || '0'),
              avgPurchasePriceMXN: parseFloat(findKey(['Avg_Price_MXN', 'Costo_MXN', 'Precio_Promedio_MXN']) || '0'),
              avgPurchasePriceUSD: parseFloat(findKey(['Avg_Price_USD', 'Costo_USD', 'Precio_Promedio_USD']) || '0'),
              realTimePrice: parseFloat(findKey(['Live_Price', 'Real_Time_Price', 'Precio_Mercado', 'Price']) || '0'),
              nativeCurrency: (findKey(['Currency', 'Moneda', 'Divisa']) as any) || 'USD'
            };
          });
          setClientPortfolio(mapped);
        } else {
          const foundClient = allClients.find(c => c.id === user.id);
          if (foundClient) {
            setClientPortfolio(foundClient.portfolio);
          }
        }
      }
    };
    loadPortfolio();
  }, [user, allClients]);

  const addOperation = (op: Operation) => {
    setOperations(prev => [...prev, op]);
    // Here we would recalculate the specific client's portfolio based on the rules:
    // Total Bought - Total Sold = Current Holding
  };

  // Simplified calculation for the MVP dashboard
  const totalNetWorthUSD = clientPortfolio.reduce((acc, asset) => {
    const value = asset.sharesOwned * (asset.nativeCurrency === 'USD' ? asset.realTimePrice : asset.realTimePrice / 16.5);
    return acc + value;
  }, 0);

  const totalNetWorthMXN = clientPortfolio.reduce((acc, asset) => {
    const value = asset.sharesOwned * (asset.nativeCurrency === 'MXN' ? asset.realTimePrice : asset.realTimePrice * 16.5);
    return acc + value;
  }, 0);

  return (
    <PortfolioContext.Provider value={{ clientPortfolio, totalNetWorthUSD, totalNetWorthMXN, addOperation, allClients }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
