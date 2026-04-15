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

const SUGGESTIONS: Record<string, { ticker: string; name: string }[]> = {
  'Stocks': [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.' },
    { ticker: 'NVDA', name: 'Nvidia Corp.' },
    { ticker: 'TSLA', name: 'Tesla Inc.' },
    { ticker: 'META', name: 'Meta Platforms' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.' },
    { ticker: 'WALMEX', name: 'Walmart de México' },
    { ticker: 'BIMBOA', name: 'Grupo Bimbo' },
    { ticker: 'FEMSAUBD', name: 'FEMSA' },
    { ticker: 'GFNORTEO', name: 'Banorte' },
    { ticker: 'AMX', name: 'América Móvil' },
    { ticker: 'CEMEXCPO', name: 'Cemex' }
  ],
  'ETFs': [
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { ticker: 'IVV', name: 'iShares Core S&P 500 ETF' },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)' },
    { ticker: 'NAFTRAC', name: 'iShares NAFTRAC (IPC Mexico)' },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market' }
  ],
  'Crypto': [
    { ticker: 'BTC', name: 'Bitcoin' },
    { ticker: 'ETH', name: 'Ethereum' },
    { ticker: 'SOL', name: 'Solana' },
    { ticker: 'BNB', name: 'Binance Coin' },
    { ticker: 'XRP', name: 'Ripple' },
    { ticker: 'ADA', name: 'Cardano' },
    { ticker: 'DOGE', name: 'Dogecoin' }
  ],
  'Fixed Income': [
    { ticker: 'CETES28', name: 'CETES 28 Días' },
    { ticker: 'CETES91', name: 'CETES 91 Días' },
    { ticker: 'CETES182', name: 'CETES 182 Días' },
    { ticker: 'CETES364', name: 'CETES 364 Días' },
    { ticker: 'BONOS', name: 'Bonos Gubernamentales (Bonos M)' },
    { ticker: 'UDIBONOS', name: 'Udibonos' },
    { ticker: 'BPAG', name: 'Bonos de Protección al Ahorro' },
  ],
  'FIBRAs': [
    { ticker: 'FUNO11', name: 'Fibra Uno' },
    { ticker: 'FMTY14', name: 'Fibra Monterrey' },
    { ticker: 'FIBRAPL14', name: 'Fibra Prologis' },
    { ticker: 'DANHOS13', name: 'Fibra Danhos' },
    { ticker: 'TERRA13', name: 'Fibra Terrafina' },
    { ticker: 'FIHO12', name: 'Fibra Hotel' },
    { ticker: 'FCFE18', name: 'Fibra CFE' }
  ],
  'Commodities': [
    { ticker: 'GLD', name: 'Gold (SPDR Gold Shares)' },
    { ticker: 'SLV', name: 'Silver (iShares Silver Trust)' },
    { ticker: 'USO', name: 'Crude Oil (US Oil Fund)' },
    { ticker: 'CORN', name: 'Corn (Teucrium Corn Fund)' },
    { ticker: 'WEAT', name: 'Wheat (Teucrium Wheat Fund)' },
  ],
  'Forex': [
    { ticker: 'USD', name: 'US Dollar (Dólar estadounidense)' },
    { ticker: 'MXN', name: 'Mexican Peso (Peso mexicano)' },
    { ticker: 'EUR', name: 'Euro' },
    { ticker: 'GBP', name: 'British Pound (Libra esterlina)' },
    { ticker: 'JPY', name: 'Japanese Yen (Yen japonés)' },
    { ticker: 'CAD', name: 'Canadian Dollar' },
    { ticker: 'CHF', name: 'Swiss Franc (Franco suizo)' },
    { ticker: 'AUD', name: 'Australian Dollar' },
    { ticker: 'CNY', name: 'Chinese Yuan (Yuan chino)' }
  ]
};

const SmartTransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  defaultAssetType,
  editAsset,
}) => {
  const isEditMode = !!editAsset;

  const { allClients, refreshPortfolio } = usePortfolio();
  const { exchangeRate, formatValue } = useCurrency();

  const client = allClients.find(c => c.id === clientId);

  // All fields are identical to "Nueva Operación" — just pre-filled when editing
  const [ticker, setTicker] = useState(editAsset?.ticker ?? 'AAPL');
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const initialAssetType = isEditMode
    ? (editAsset!.type as any)
    : (defaultAssetType && defaultAssetType !== 'All') ? defaultAssetType : 'Stocks';
  const [assetType, setAssetType] = useState(initialAssetType);
  const initialCurrency = editAsset?.nativeCurrency ?? 'USD';
  const initialPrice = editAsset 
    ? (initialCurrency === 'USD' ? editAsset.avgPurchasePriceUSD : editAsset.avgPurchasePriceMXN) 
    : '';

  const [shares, setShares] = useState<number | string>(editAsset?.sharesOwned ?? '');
  const [price, setPrice] = useState<number | string>(initialPrice);
  const [commission, setCommission] = useState<number | string>(isEditMode ? 0 : '');
  const [currency, setCurrency] = useState<'USD' | 'MXN'>(initialCurrency);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableSuggestions = SUGGESTIONS[assetType] || [];
  const filteredSuggestions = availableSuggestions.filter(s =>
    s.ticker.toLowerCase().includes(ticker.toLowerCase()) || 
    s.name.toLowerCase().includes(ticker.toLowerCase())
  );

  // Current holdings for balance badge
  const currentAsset = client?.portfolio.find(a => a.ticker === ticker);
  const sharesOwned = currentAsset?.sharesOwned || 0;

  const numShares = Number(shares) || 0;
  const numPrice = Number(price) || 0;
  const numCommission = Number(commission) || 0;

  const totalTransaction = (numShares * numPrice) + numCommission;

  const showBalanceWarning = type === 'Sell' && numShares > sharesOwned;

  const calculateNewAvg = () => {
    if (!currentAsset) return numPrice;
    if (type === 'Sell') return currentAsset.avgPurchasePriceUSD;
    const currentTotalCostUSD = currentAsset.avgPurchasePriceUSD * currentAsset.sharesOwned;
    const newTotalCostUSD = currency === 'USD' ? totalTransaction : totalTransaction / exchangeRate;
    const totalNewShares = currentAsset.sharesOwned + numShares;
    return totalNewShares > 0 ? (currentTotalCostUSD + newTotalCostUSD) / totalNewShares : 0;
  };

  const newAvgUSD = calculateNewAvg();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const totalTrans = (numShares * numPrice) + numCommission;
    const calculatedTotalMXN = currency === 'USD' ? totalTrans * exchangeRate : totalTrans;

    // Edit mode sends as Edit, new operation keeps Buy/Sell
    const operationType = isEditMode ? 'Edit' : type;

    const success = await submitOperation({
      clientId,
      type: operationType,
      assetType,
      ticker,
      shares: numShares,
      price: numPrice,
      commission: numCommission,
      originalCurrency: currency,
      Cliente_ID: clientId,
      Tipo_Operacion: operationType,
      Ticker: ticker,
      Tipo_Activo: assetType,
      Cantidad: numShares,
      Precio: numPrice,
      Comision: numCommission,
      Comisión: numCommission,
      Moneda: currency,
      Total_MXN: calculatedTotalMXN,
      date: date
    });

    setIsSubmitting(false);
    if (success) {
      await refreshPortfolio();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
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
            <div className="space-y-2 relative" ref={suggestionsRef}>
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Instrumento (Ticker)
              </label>
              <input
                value={ticker}
                onChange={e => {
                  setTicker(e.target.value.toUpperCase());
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="glass-input"
                placeholder="Ej. AAPL"
              />
              {/* Autocomplete Dropdown */}
              {showSuggestions && (ticker.length > 0 || availableSuggestions.length > 0) && (
                <div className="absolute top-[100%] mt-1 left-0 right-0 max-h-48 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl z-50 shadow-2xl scrollbar-hide py-1">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion) => (
                      <div 
                        key={suggestion.ticker}
                        onClick={() => {
                          setTicker(suggestion.ticker);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-bold text-white text-sm">{suggestion.ticker}</span>
                        <span className="text-xs text-gray-400 truncate ml-2 text-right">{suggestion.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-gray-500 text-center italic">
                      Pulsa Enter para añadir "{ticker}" como nuevo
                    </div>
                  )}
                </div>
              )}
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
                value={shares}
                onChange={e => setShares(e.target.value === '' ? '' : Number(e.target.value))}
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
                value={price}
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
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
                value={commission}
                onChange={e => setCommission(e.target.value === '' ? '' : Number(e.target.value))}
                className="glass-input"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* ── Date ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
              Fecha de Operación
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="glass-input cursor-pointer w-full"
            />
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
            disabled={showBalanceWarning || numShares <= 0 || numPrice <= 0 || isSubmitting}
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
