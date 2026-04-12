import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CURRENCY_TRACKER } from '../data/MockData';
import { fetchCsvData, SHEET_URLS } from '../services/sheetsService';

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
    // If an asset is locked to a specific currency (like CETES to MXN), we might show it in that currency
    // but the dashboard usually converts everything to the preferred view.
    const displayCurrency = assetCurrency || currency;
    
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
