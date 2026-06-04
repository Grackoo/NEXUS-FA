import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';

// PROTECTED CREDENTIALS
const ADMIN_CREDENTIALS = {
  id: 'Admin',
  password: 'Grackoo039'
};

export interface ClientProfile {
  id: string;
  name: string;
  role: 'admin' | 'client';
  password?: string;
  email?: string;
  phone?: string;
  riskProfile?: 'Conservador' | 'Moderado' | 'Agresivo';
  investmentHorizon?: string;
  liquidityNeeds?: string;
  lastCommunication?: string;
}

interface AuthContextType {
  user: ClientProfile | null;
  login: (id: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
  impersonateClient?: (client: ClientProfile) => void;
  isAdminImpersonating: boolean;
  stopImpersonating: () => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  registerLocalClient: (client: ClientProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [authorizedClients, setAuthorizedClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);

  const togglePrivacyMode = () => setIsPrivacyMode(prev => !prev);

  useEffect(() => {
    const loadAuthorizedClients = async () => {
      if (SHEET_URLS.CLIENTS_DATA) {
        const data = await fetchCsvData(SHEET_URLS.CLIENTS_DATA);
        const mapped: ClientProfile[] = data.map((row: any) => {
          // Helper para encontrar campos sin importar mayúsculas/minúsculas
          const find = (keys: string[]) => {
            const found = Object.keys(row).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
            return found ? row[found] : '';
          };

          return {
            id: find(['ID']),
            name: find(['Nombre', 'NOMBRE']),
            role: 'client' as 'client',
            password: find(['Password', 'PASSWORD']),
            email: find(['Email', 'EMAIL']),
            phone: find(['Telefono', 'TELEFONO']),
            riskProfile: (find(['Perfil_Riesgo', 'PERFIL_RIESGO', 'RiskProfile']) as any) || 'Moderado',
            investmentHorizon: find(['Horizonte_Inversion', 'HorizonteInversion']),
            liquidityNeeds: find(['Necesidades_Liquidez', 'NecesidadesLiquidez']),
            lastCommunication: find(['Ultima_Comunicacion', 'UltimaComunicacion'])
          };
        }).filter((c: any) => c.id);
        
        const saved = localStorage.getItem('nexus_local_clients');
        const localClients = saved ? JSON.parse(saved) : [];
        
        // Remove duplicates if the remote sheet already has the local client
        const merged = [...mapped];
        localClients.forEach((lc: ClientProfile) => {
          if (!merged.find(m => m.id === lc.id)) {
            merged.push(lc);
          }
        });

        setAuthorizedClients(merged);
      }
      setIsLoading(false);
    };
    loadAuthorizedClients();
  }, []);

  const login = async (id: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Check Admin (Normalized to Uppercase for matching the UI)
    if (id.toUpperCase() === ADMIN_CREDENTIALS.id.toUpperCase() && pass === ADMIN_CREDENTIALS.password) {
      setUser({ id: 'Admin', name: 'Administrador', role: 'admin' });
      return { success: true };
    }

    // 2. Refresh client list from sheet
    let currentClients = authorizedClients;
    if (SHEET_URLS.CLIENTS_DATA) {
        const data = await fetchCsvData(SHEET_URLS.CLIENTS_DATA);
        currentClients = data.map((row: any) => {
            const find = (keys: string[]) => {
                const found = Object.keys(row).find(k => keys.some(target => k.toLowerCase().trim() === target.toLowerCase()));
                return found ? row[found] : '';
            };
            return {
                id: find(['ID']),
                name: find(['Nombre', 'NOMBRE']),
                role: 'client' as 'client',
                password: find(['Password', 'PASSWORD']),
                riskProfile: (find(['Perfil_Riesgo', 'PERFIL_RIESGO', 'RiskProfile']) as any) || 'Moderado',
                investmentHorizon: find(['Horizonte_Inversion', 'HorizonteInversion']),
                liquidityNeeds: find(['Necesidades_Liquidez', 'NecesidadesLiquidez']),
                lastCommunication: find(['Ultima_Comunicacion', 'UltimaComunicacion'])
            } as ClientProfile;
        }).filter((c: any) => c.id);

        const saved = localStorage.getItem('nexus_local_clients');
        const localClients = saved ? JSON.parse(saved) : [];
        
        const merged = [...currentClients];
        localClients.forEach((lc: ClientProfile) => {
          if (!merged.find(m => m.id === lc.id)) {
            merged.push(lc);
          }
        });

        currentClients = merged;
        setAuthorizedClients(currentClients);
    }

    // 3. Check Clients
    const client = currentClients.find(c => c.id === id && c.password === pass);
    if (client) {
      setUser(client);
      return { success: true };
    }

    return { success: false, message: 'ID o Contraseña incorrectos.' };
  };

  const logout = () => {
    setUser(null);
    setIsAdminImpersonating(false);
  };

  const impersonateClient = (client: ClientProfile) => {
    setUser(client);
    setIsAdminImpersonating(true);
  };

  const stopImpersonating = () => {
    setUser({ id: 'Admin', name: 'Administrador', role: 'admin' });
    setIsAdminImpersonating(false);
  };

  const registerLocalClient = (client: ClientProfile) => {
    const saved = localStorage.getItem('nexus_local_clients');
    const localClients = saved ? JSON.parse(saved) : [];
    localClients.push(client);
    localStorage.setItem('nexus_local_clients', JSON.stringify(localClients));
    setAuthorizedClients(prev => [...prev, client]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, impersonateClient, isAdminImpersonating, stopImpersonating, isPrivacyMode, togglePrivacyMode, registerLocalClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
