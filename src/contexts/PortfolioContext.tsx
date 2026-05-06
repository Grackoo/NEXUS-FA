import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type ClientProfile } from './AuthContext';
import { fetchCsvData, fetchPortfolioData, SHEET_URLS } from '../services/sheetsService';
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
  thesis?: string;
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
  const [clientPortfolio, setClientPortfolio] = useState<PortfolioAsset[]>([]);
  const [clientOperations, setClientOperations] = useState<Operation[]>([]);
  const [allClients, setAllClients] = useState<ClientWithPortfolio[]>([]);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [totalNetWorthMXN, setTotalNetWorthMXN] = useState(0);
  const [totalNetWorthUSD, setTotalNetWorthUSD] = useState(0);

  // 1. Sync All Clients & Portfolios
  const refreshPortfolio = async () => {
    setIsLoading(true);
    try {
      let mappedClients: ClientWithPortfolio[] = [];
      
      // Mantenemos la carga de la lista de clientes para usos administrativos
      if (SHEET_URLS.CLIENTS_DATA) {
        const clientsRaw = await fetchCsvData(SHEET_URLS.CLIENTS_DATA);
        mappedClients = clientsRaw.map((row: any) => ({
          id: row.ID || row.id || '',
          name: row.Nombre || row.name || '',
          role: (row.Role || row.role || 'client') as 'admin' | 'client',
          email: row.Email || row.email || '',
          phone: row.Telefono || row.phone || '',
          portfolio: [] // El portfolio se cargará desde el servidor
        })).filter((c: any) => c.id);
        
        setAllClients(mappedClients);
      }

      // Si hay un usuario activo, obtenemos su portafolio calculado en el servidor
      if (user) {
        const serverData = await fetchPortfolioData(user.id);
        
        if (serverData) {
          setClientPortfolio(serverData.portfolio || []);
          setClientOperations(serverData.operations || []);
          
          if (serverData.totals) {
            setTotalNetWorthMXN(serverData.totals.netWorthMXN || 0);
            setTotalNetWorthUSD(serverData.totals.netWorthUSD || 0);
          }

          // Opcional: Actualizar el portafolio del cliente activo en allClients
          const updatedClients = mappedClients.map(c => 
            c.id === user.id ? { ...c, portfolio: serverData.portfolio || [] } : c
          );
          setAllClients(updatedClients);
          setAllOperations(serverData.operations || []);
        }
      }
    } catch (error) {
      console.error('Error syncing portfolios:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshPortfolio();
  }, [user]);

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
