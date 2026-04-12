export interface PortfolioAsset {
  ticker: string;
  type: 'Stocks' | 'ETFs' | 'Fixed Income' | 'Crypto';
  sharesOwned: number;
  avgPurchasePriceMXN: number;
  avgPurchasePriceUSD: number;
  realTimePrice: number; // Stored in its native currency (e.g., USD for stocks, MXN for CETES)
  nativeCurrency: 'USD' | 'MXN';
}

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
      { ticker: 'AAPL', type: 'Stocks', sharesOwned: 10, avgPurchasePriceMXN: 2500, avgPurchasePriceUSD: 145, realTimePrice: 170, nativeCurrency: 'USD' },
      { ticker: 'IVV', type: 'ETFs', sharesOwned: 5, avgPurchasePriceMXN: 8000, avgPurchasePriceUSD: 450, realTimePrice: 510, nativeCurrency: 'USD' },
      { ticker: 'CETES', type: 'Fixed Income', sharesOwned: 1000, avgPurchasePriceMXN: 10, avgPurchasePriceUSD: 0.60, realTimePrice: 10.5, nativeCurrency: 'MXN' }
    ]
  },
  {
    id: 'client-2',
    name: 'Aldo Lopez',
    role: 'client',
    portfolio: [
      { ticker: 'NVDA', type: 'Stocks', sharesOwned: 20, avgPurchasePriceMXN: 10000, avgPurchasePriceUSD: 550, realTimePrice: 900, nativeCurrency: 'USD' },
      { ticker: 'BTC', type: 'Crypto', sharesOwned: 0.5, avgPurchasePriceMXN: 800000, avgPurchasePriceUSD: 45000, realTimePrice: 65000, nativeCurrency: 'USD' }
    ]
  }
];

export interface Operation {
  id: string;
  clientId: string;
  type: 'Buy' | 'Sell';
  ticker: string;
  shares: number;
  price: number;
  commission: number;
  originalCurrency: 'USD' | 'MXN';
  date: string;
}

export const MOCK_OPERACIONES: Operation[] = [
  { id: 'op1', clientId: 'client-1', type: 'Buy', ticker: 'AAPL', shares: 10, price: 145, commission: 2, originalCurrency: 'USD', date: '2024-01-10' },
  { id: 'op2', clientId: 'client-1', type: 'Buy', ticker: 'IVV', shares: 5, price: 450, commission: 5, originalCurrency: 'USD', date: '2024-02-15' },
  { id: 'op3', clientId: 'client-2', type: 'Buy', ticker: 'NVDA', shares: 20, price: 550, commission: 10, originalCurrency: 'USD', date: '2024-03-01' }
];
