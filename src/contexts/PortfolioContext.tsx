import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_CLIENTS, MOCK_OPERACIONES, Operation, PortfolioAsset, Client } from '../data/MockData';

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
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERACIONES);
  const [allClients, setAllClients] = useState<Client[]>(MOCK_CLIENTS);

  useEffect(() => {
    if (user) {
      // Logic to calculate portfolio from operations or use summary
      // For this MVP, we use the pre-calculated summary in MOCK_CLIENTS
      // but in a real app, we'd aggregate 'operations' here.
      const foundClient = allClients.find(c => c.id === user.id);
      if (foundClient) {
        setClientPortfolio(foundClient.portfolio);
      }
    }
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
