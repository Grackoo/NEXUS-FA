import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_CLIENTS, Client } from '../data/MockData';

interface AuthContextType {
  user: Client | null;
  login: (clientId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Client | null>(null);

  const login = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (client) {
      setUser(client);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
