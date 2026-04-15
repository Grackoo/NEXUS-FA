import React, { useState } from 'react';
import { X, Calculator, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { submitOperation } from '../services/sheetsService';

export interface EditAsset {
  ticker: string;
  type: string;
  sharesOwned: number;
  avgPurchasePriceUSD: number;
  avgPurchasePriceMXN: number;
  nativeCurrency: 'USD' | 'MXN';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  defaultAssetType?: 'Stocks' | 'ETFs' | 'Fixed Income' | 'Crypto' | 'FIBRAs' | 'Commodities' | 'Forex' | 'All';
  /** When passed, the modal opens pre-filled with this asset's data for editing */
  editAsset?: EditAsset;
}

const SmartTransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  defaultAssetType,
  editAsset,
}) => {
  const isEditMode = !!editAsset;

  const { allClients } = usePortfolio();
  const { exchangeRate, formatValue } = useCurrency();

  const client = allClients.find(c => c.id === clientId);

  // All fields are identical to "Nueva Operación" — just pre-filled when editing
  const [ticker, setTicker] = useState(editAsset?.ticker ?? 'AAPL');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const initialAssetType = isEditMode
    ? (editAsset!.type as any)
    : (defaultAssetType && defaultAssetType !== 'All') ? defaultAssetType : 'Stocks';
  const [assetType, setAssetType] = useState(initialAssetType);
  const [shares, setShares] = useState<number>(editAsset?.sharesOwned ?? 0);
  const [price, setPrice] = useState<number>(editAsset?.avgPurchasePriceUSD ?? 0);
  const [commission, setCommission] = useState<number>(0);
  const [currency, setCurrency] = useState<'USD' | 'MXN'>(editAsset?.nativeCurrency ?? 'USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Current holdings for balance badge
  const currentAsset = client?.portfolio.find(a => a.ticker === ticker);
  const sharesOwned = currentAsset?.sharesOwned || 0;

  const totalTransaction = (shares * price) + commission;

  const showBalanceWarning = type === 'Sell' && shares > sharesOwned;

  const calculateNewAvg = () => {
    if (!currentAsset) return price;
    if (type === 'Sell') return currentAsset.avgPurchasePriceUSD;
    const currentTotalCostUSD = currentAsset.avgPurchasePriceUSD * currentAsset.sharesOwned;
    const newTotalCostUSD = currency === 'USD' ? totalTransaction : totalTransaction / exchangeRate;
    const totalNewShares = currentAsset.sharesOwned + shares;
    return totalNewShares > 0 ? (currentTotalCostUSD + newTotalCostUSD) / totalNewShares : 0;
  };

  const newAvgUSD = calculateNewAvg();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const totalTrans = (shares * price) + commission;
    const calculatedTotalMXN = currency === 'USD' ? totalTrans * exchangeRate : totalTrans;

    // Edit mode sends as Adjustment, new operation keeps Buy/Sell
    const operationType = isEditMode ? 'Adjustment' : type;

    const success = await submitOperation({
      clientId,
      type: operationType,
      assetType,
      ticker,
      shares,
      price,
      commission,
      originalCurrency: currency,
      Cliente_ID: clientId,
      Tipo_Operacion: operationType,
      Ticker: ticker,
      Tipo_Activo: assetType,
      Cantidad: shares,
      Precio: price,
      Comision: commission,
      Comisión: commission,
      Moneda: currency,
      Total_MXN: calculatedTotalMXN,
    });

    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg p-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-primary" />
              {isEditMode ? 'Editar Operación' : 'Nueva Operación'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cliente: <span className="text-white font-semibold">{clientName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">

          {/* ── Buy / Sell ── */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setType('Buy')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                type === 'Buy'
                  ? 'bg-emerald/20 text-emerald border-emerald/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              COMPRAR
            </button>
            <button
              onClick={() => setType('Sell')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                type === 'Sell'
                  ? 'bg-crimson/20 text-crimson border-crimson/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              VENDER
            </button>
          </div>

          {/* ── Ticker + Asset Type ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Instrumento (Ticker)
              </label>
              <input
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                className="glass-input"
                placeholder="AAPL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Tipo de Activo
              </label>
              <select
                value={assetType}
                onChange={e => setAssetType(e.target.value as any)}
                className="glass-input cursor-pointer"
              >
                <option value="Stocks">Acciones (Stocks)</option>
                <option value="ETFs">ETFs</option>
                <option value="Crypto">Criptomonedas</option>
                <option value="FIBRAs">FIBRAs / Real Estate</option>
                <option value="Fixed Income">Renta Fija (CETES)</option>
                <option value="Commodities">Commodities</option>
                <option value="Forex">Forex</option>
              </select>
            </div>
          </div>

          {/* ── Currency + Shares ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">Moneda</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="glass-input cursor-pointer"
              >
                <option value="USD">Dólar (USD)</option>
                <option value="MXN">Peso (MXN)</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
                  Títulos / Cantidad
                </label>
                {sharesOwned > 0 && (
                  <span className="text-[10px] text-primary font-bold px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    Actual: {sharesOwned}
                  </span>
                )}
              </div>
              <input
                type="number"
                value={shares || ''}
                onChange={e => setShares(Number(e.target.value))}
                className="glass-input"
                placeholder="0"
              />
            </div>
          </div>

          {/* ── Price + Commission ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Precio Unitario
              </label>
              <input
                type="number"
                value={price || ''}
                onChange={e => setPrice(Number(e.target.value))}
                className="glass-input"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Comisión (Total)
              </label>
              <input
                type="number"
                value={commission || ''}
                onChange={e => setCommission(Number(e.target.value))}
                className="glass-input"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Total Operación:</p>
              <p className="font-bold">{formatValue(totalTransaction, currency)}</p>
            </div>

            {type === 'Buy' && (
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Calculator className="w-3 h-3" /> Costo Promedio Estimado:
                </p>
                <p className="font-bold text-primary">{formatValue(newAvgUSD, 'USD')}</p>
              </div>
            )}

            {showBalanceWarning && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-crimson/10 border border-crimson/20 text-crimson text-xs animate-pulse">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Atención:</strong> El cliente solo posee <b>{sharesOwned}</b> títulos de {ticker}. No puede vender {shares}.
                </p>
              </div>
            )}
          </div>

          {/* ── Confirm button ── */}
          <button
            disabled={showBalanceWarning || shares <= 0 || price <= 0 || isSubmitting}
            onClick={handleConfirm}
            className="glass-button w-full shadow-[0_0_20px_rgba(26,92,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <RefreshCcw className="w-5 h-5 animate-spin mx-auto" />
            ) : isSuccess ? (
              <span className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5" />
                {isEditMode ? '¡Cambios Guardados!' : '¡Operación Registrada!'}
              </span>
            ) : (
              isEditMode ? 'Guardar Cambios' : 'Confirmar y Registrar Operación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartTransactionModal;
