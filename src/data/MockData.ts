import type { PortfolioAsset, Operation } from '../types';

export interface Client {
  id: string;
  name: string;
  role: 'admin' | 'client';
  portfolio: PortfolioAsset[];
}

export const CURRENCY_TRACKER = {
  USD_MXN_RATE: 16.50 // Mock live spot rate
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'admin-1',
    name: 'Wealth Manager',
    role: 'admin',
    portfolio: []
  },
  {
    id: 'client-1',
    name: 'Aketzali Garcia',
    role: 'client',
    portfolio: [
      { ticker: 'AAPL', type: 'Renta Variable', sharesOwned: 10, avgPurchasePriceMXN: 2500, avgPurchasePriceUSD: 145, realTimePrice: 170, nativeCurrency: 'USD' },
      { ticker: 'IVV', type: 'Renta Variable', sharesOwned: 5, avgPurchasePriceMXN: 8000, avgPurchasePriceUSD: 450, realTimePrice: 510, nativeCurrency: 'USD' },
      { ticker: 'CETES', type: 'Renta Fija', sharesOwned: 1000, avgPurchasePriceMXN: 10, avgPurchasePriceUSD: 0.60, realTimePrice: 10.5, nativeCurrency: 'MXN' },
      { ticker: 'FIBRAPL14', type: 'Renta Variable', sharesOwned: 100, avgPurchasePriceMXN: 55, avgPurchasePriceUSD: 3.33, realTimePrice: 58.5, nativeCurrency: 'MXN' }
    ]
  },
  {
    id: 'client-2',
    name: 'Aldo Lopez',
    role: 'client',
    portfolio: [
      { ticker: 'NVDA', type: 'Renta Variable', sharesOwned: 20, avgPurchasePriceMXN: 10000, avgPurchasePriceUSD: 550, realTimePrice: 900, nativeCurrency: 'USD' },
      { ticker: 'BTC', type: 'Criptomonedas', sharesOwned: 0.5, avgPurchasePriceMXN: 800000, avgPurchasePriceUSD: 45000, realTimePrice: 65000, nativeCurrency: 'USD' },
      { ticker: 'GOLD', type: 'Renta Variable', sharesOwned: 10, avgPurchasePriceMXN: 33000, avgPurchasePriceUSD: 2000, realTimePrice: 2350, nativeCurrency: 'USD' }
    ]
  }
];

// Operations are now defined in src/types/index.ts
export const MOCK_OPERACIONES: Operation[] = [
  { id: 'op1', clientId: 'client-1', type: 'Buy', assetType: 'Renta Variable', ticker: 'AAPL', shares: 10, price: 145, commission: 2, originalCurrency: 'USD', date: '2024-01-10' },
  { id: 'op2', clientId: 'client-1', type: 'Buy', assetType: 'Renta Variable', ticker: 'IVV', shares: 5, price: 450, commission: 5, originalCurrency: 'USD', date: '2024-02-15' },
  { id: 'op3', clientId: 'client-2', type: 'Buy', assetType: 'Renta Variable', ticker: 'NVDA', shares: 20, price: 550, commission: 10, originalCurrency: 'USD', date: '2024-03-01' }
];
