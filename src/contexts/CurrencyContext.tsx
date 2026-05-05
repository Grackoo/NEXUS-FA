import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { CURRENCY_TRACKER } from '../data/MockData';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';
import { useAuth } from './AuthContext';

type Currency = 'USD' | 'MXN';

interface CurrencyContextType {
  currency: Currency;
  exchangeRate: number;
  toggleCurrency: () => void;
  formatValue: (value: number, assetCurrency?: Currency) => string;
  convertToView: (value: number, from: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState(CURRENCY_TRACKER.USD_MXN_RATE);
  const { isPrivacyMode } = useAuth();

  useEffect(() => {
    const loadRate = async () => {
      if (SHEET_URLS.CURRENCY_TRACKER) {
        const data = await fetchCsvData(SHEET_URLS.CURRENCY_TRACKER);
        if (data && data.length > 0) {
          // Expecting a column 'FX_Rate' or similar
          const rate = parseFloat(data[0].FX_Rate || data[0].rate);
          if (!isNaN(rate)) setExchangeRate(rate);
        }
      }
    };
    loadRate();
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'USD' ? 'MXN' : 'USD'));
  };

  const convertToView = (value: number, from: Currency): number => {
    if (from === currency) return value;
    if (from === 'USD' && currency === 'MXN') return value * exchangeRate;
    if (from === 'MXN' && currency === 'USD') return value / exchangeRate;
    return value;
  };

  const formatValue = (value: number, assetCurrency?: Currency) => {
    const displayCurrency = assetCurrency || currency;
    
    if (isPrivacyMode) {
      return displayCurrency === 'USD' ? 'USD ••••••' : 'MXN ••••••';
    }

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRate, toggleCurrency, formatValue, convertToView }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
