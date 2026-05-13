/**
 * @file src/types/index.ts
 * @description Centralized type definitions for NEXUS FA.
 */

export type AssetCategory = 'Renta Variable' | 'Criptomonedas' | 'Renta Fija' | 'Liquidez' | 'Divisas' | 'FIBRAs' | 'Commodities' | 'Forex' | 'All';

/**
 * Representa un activo dentro de un portafolio
 */
export interface PortfolioAsset {
  ticker: string;
  type: AssetCategory | string;
  sharesOwned: number;
  avgPurchasePriceMXN: number;
  avgPurchasePriceUSD: number;
  realTimePrice: number;
  nativeCurrency: 'USD' | 'MXN';
  logoUrl?: string;
  /** Precio objetivo opcional para alerta de salida */
  target?: number; 
  /** Alertas visuales TP/SL */
  takeProfit?: number;
  stopLoss?: number;
  /** Rendimiento por dividendo estimado (ej: 0.05 = 5%) */
  dividendYield?: number;
}

/**
 * Representa una meta financiera del cliente
 */
export interface ClientGoal {
  id: string;
  clientId: string;
  name: string;
  targetAmount: number;
}

/**
 * Representa una operación o transacción financiera
 */
export interface Operation {
  id?: string;
  orderId: string; // ID de pedidos único
  clientId: string;
  type: string;
  assetType: AssetCategory | string;
  ticker: string;
  shares: number;
  price: number;
  commission: number;
  originalCurrency?: 'USD' | 'MXN';
  currency?: string;
  totalMXN?: number;
  date: string;
  thesis?: string;
}
