import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth, type ClientProfile } from './AuthContext';
import { SHEET_URLS } from '../services/sheetsService';
import { useCachedData } from '../hooks/useCachedData';
import { type PortfolioAsset, type Operation } from '../types';

export type { Operation };

export interface ClientWithPortfolio extends ClientProfile {
  portfolio: PortfolioAsset[];
  operations: Operation[];
}

interface PortfolioContextType {
  clientPortfolio: PortfolioAsset[];
  clientOperations: Operation[];
  totalNetWorthUSD: number;
  totalNetWorthMXN: number;
  estimatedAnnualDividendsUSD: number;
  allClients: ClientWithPortfolio[];
  allOperations: Operation[];
  isLoading: boolean;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { fetchCsvCached, fetchPortfolioCached } = useCachedData();
  const [clientPortfolio, setClientPortfolio] = useState<PortfolioAsset[]>([]);
  const [clientOperations, setClientOperations] = useState<Operation[]>([]);
  const [allClients, setAllClients] = useState<ClientWithPortfolio[]>([]);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [totalNetWorthMXN, setTotalNetWorthMXN] = useState(0);
  const [totalNetWorthUSD, setTotalNetWorthUSD] = useState(0);

  // Diccionario de yields estimados (rendimiento anual)
  const DIVIDEND_YIELDS: Record<string, number> = {
    'AAPL': 0.005,
    'OXY': 0.015,
    'KO': 0.03,
    'JNJ': 0.03,
    'T': 0.065,
    'XOM': 0.033,
    'IVV': 0.013,
    'SPY': 0.013,
    'FIBRAPL14': 0.06,
    'FUNO11': 0.08,
  };

  const estimatedAnnualDividendsUSD = clientPortfolio.reduce((acc, asset) => {
    const yieldRate = asset.dividendYield || DIVIDEND_YIELDS[asset.ticker] || 0;
    if (yieldRate > 0) {
      const valueUSD = asset.nativeCurrency === 'USD' 
        ? asset.sharesOwned * asset.realTimePrice 
        : (asset.sharesOwned * asset.realTimePrice) / 16.5; 
      return acc + (valueUSD * yieldRate);
    }
    return acc;
  }, 0);

  // 1. Sync All Clients & Portfolios
  const refreshPortfolio = async () => {
    setIsLoading(true);
    try {
      let mappedClients: ClientWithPortfolio[] = [];
      
      // Mantenemos la carga de la lista de clientes para usos administrativos
      if (SHEET_URLS.CLIENTS_DATA) {
        const clientsRaw = await fetchCsvCached(SHEET_URLS.CLIENTS_DATA);
        mappedClients = clientsRaw.map((row: any) => ({
          id: row.ID || row.id || '',
          name: row.Nombre || row.name || '',
          role: (row.Role || row.role || 'client') as 'admin' | 'client',
          email: row.Email || row.email || '',
          phone: row.Telefono || row.phone || '',
          portfolio: [], // El portfolio se cargará desde el servidor
          operations: []
        })).filter((c: any) => c.id);
        
        setAllClients(mappedClients);
      }

      // Si hay un usuario activo, obtenemos su portafolio calculado en el servidor
      if (user) {
        if (user.role === 'admin') {
          // Si es admin, cargamos los portafolios de todos los clientes
          const clientIds = mappedClients.filter(c => c.role === 'client').map(c => c.id);
          const allPortfolios = await Promise.all(
            clientIds.map(async (id) => {
              const data = await fetchPortfolioCached(id);
              return { id, data };
            })
          );
          
          const updatedClients = mappedClients.map(c => {
            const fetched = allPortfolios.find(p => p.id === c.id);
            if (fetched && fetched.data) {
              return { 
                ...c, 
                portfolio: fetched.data.portfolio || [],
                operations: fetched.data.operations || []
              };
            }
            return c;
          });
          
          setAllClients(updatedClients);
          
          // También cargamos el portafolio del propio admin si tuviera (opcional, suele ser 0)
          const adminData = await fetchPortfolioCached(user.id);
          if (adminData) {
            setClientPortfolio(adminData.portfolio || []);
            setClientOperations(adminData.operations || []);
            if (adminData.totals) {
              setTotalNetWorthMXN(adminData.totals.netWorthMXN || 0);
              setTotalNetWorthUSD(adminData.totals.netWorthUSD || 0);
            }
          }
        } else {
          // Si es cliente, cargamos solo su portafolio
          const serverData = await fetchPortfolioCached(user.id);
          
          if (serverData) {
            setClientPortfolio(serverData.portfolio || []);
            setClientOperations(serverData.operations || []);
            
            if (serverData.totals) {
              setTotalNetWorthMXN(serverData.totals.netWorthMXN || 0);
              setTotalNetWorthUSD(serverData.totals.netWorthUSD || 0);
            }

            const updatedClients = mappedClients.map(c => 
              c.id === user.id ? { 
                ...c, 
                portfolio: serverData.portfolio || [],
                operations: serverData.operations || []
              } : c
            );
            setAllClients(updatedClients);
            setAllOperations(serverData.operations || []);
          }
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
      estimatedAnnualDividendsUSD,
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
