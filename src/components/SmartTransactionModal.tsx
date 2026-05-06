import React, { useState } from 'react';
import { X, Calculator, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { submitOperation, deletePosition } from '../services/sheetsService';
import { AllocationDonut } from './charts/AllocationDonut';
import { Settings2 } from 'lucide-react';

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
  defaultAssetType?: 'Stocks' | 'ETFs' | 'Renta Fija' | 'Crypto' | 'FIBRAs' | 'Commodities' | 'Forex' | 'All';
  /** When passed, the modal opens pre-filled with this asset's data for editing */
  editAsset?: EditAsset;
}

const SUGGESTIONS: Record<string, { ticker: string; name: string }[]> = {
  'Renta Variable': [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
    { ticker: 'NVDA', name: 'Nvidia Corp.' },
    { ticker: 'IVV', name: 'iShares Core S&P 500 ETF' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust' },
    { ticker: 'FUNO11', name: 'Fibra Uno' },
    { ticker: 'GLD', name: 'Oro (SPDR Gold Shares)' }
  ],
  'Criptomonedas': [
    { ticker: 'BTC', name: 'Bitcoin' },
    { ticker: 'ETH', name: 'Ethereum' },
    { ticker: 'SOL', name: 'Solana' },
    { ticker: 'BNB', name: 'Binance Coin' },
    { ticker: 'USDT', name: 'Tether' }
  ],
  'Renta Fija': [
    { ticker: 'CETES28', name: 'CETES 28 Días' },
    { ticker: 'BONOS', name: 'Bonos Gubernamentales' },
    { ticker: 'UDIBONOS', name: 'Udibonos' },
  ],
  'Divisas': [
    { ticker: 'USD', name: 'US Dollar' },
    { ticker: 'EUR', name: 'Euro' },
    { ticker: 'JPY', name: 'Japanese Yen' },
    { ticker: 'GBP', name: 'British Pound' }
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
    : (defaultAssetType && defaultAssetType !== 'All') ? defaultAssetType : 'Renta Variable';
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
  const [thesis, setThesis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

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
    if (isSimulationMode) return;
    setIsSubmitting(true);
    const totalTrans = (numShares * numPrice) + numCommission;
    const calculatedTotalMXN = currency === 'USD' ? totalTrans * exchangeRate : totalTrans;

    // Si estamos editando, sobrescribimos toda la posición
    if (isEditMode) {
      await deletePosition(clientId, ticker, assetType);
    }

    const operationType = isEditMode ? 'Buy' : type;
    const finalAssetType = assetType === 'Divisas' ? 'Forex' : assetType;

    const success = await submitOperation({
      clientId,
      type: operationType,
      assetType: finalAssetType,
      ticker,
      shares: numShares,
      price: numPrice,
      commission: numCommission,
      originalCurrency: currency,
      Cliente_ID: clientId,
      Tipo_Operacion: operationType,
      Ticker: ticker,
      Tipo_Activo: finalAssetType,
      Cantidad: numShares,
      Precio: numPrice,
      Comision: numCommission,
      Comisión: numCommission,
      Moneda: currency,
      Total_MXN: calculatedTotalMXN,
      date: date,
      Tesis_Inversion: thesis,
      thesis: thesis
    });

    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
      
      // Delay fetching the CSV by 2.5 seconds to give Google Sheets time to update its published CSV endpoint
      setTimeout(async () => {
        await refreshPortfolio();
        setIsSuccess(false);
        onClose();
      }, 2500);
    }
  };

  const getSimulatedPortfolio = () => {
    if (!client) return [];
    const newPortfolio = JSON.parse(JSON.stringify(client.portfolio));
    const assetIndex = newPortfolio.findIndex((a: any) => a.ticker === ticker);
    const finalAssetType = assetType === 'Divisas' ? 'Forex' : assetType;
    
    if (assetIndex >= 0) {
      if (type === 'Buy') {
        newPortfolio[assetIndex].sharesOwned += numShares;
      } else {
        newPortfolio[assetIndex].sharesOwned = Math.max(0, newPortfolio[assetIndex].sharesOwned - numShares);
      }
    } else if (type === 'Buy' && numShares > 0) {
      newPortfolio.push({
        ticker,
        type: finalAssetType,
        sharesOwned: numShares,
        realTimePrice: numPrice,
        nativeCurrency: currency,
        avgPurchasePriceUSD: newAvgUSD,
        avgPurchasePriceMXN: newAvgUSD * exchangeRate
      });
    }
    return newPortfolio;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 100 }}>
      <div className={`glass-card w-full ${isSimulationMode ? 'max-w-4xl' : 'max-w-lg'} p-0 overflow-hidden transition-all duration-500`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>

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

        {/* ── Toggle Simulación ── */}
        {!isEditMode && (
          <div className="px-8 py-3 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> Modo Simulación
            </span>
            <button 
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isSimulationMode ? 'bg-primary' : 'bg-gray-700'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSimulationMode ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        )}

        <div className={`flex flex-col ${isSimulationMode ? 'md:flex-row' : ''} max-h-[80vh] overflow-y-auto`}>
          <div className={`p-8 space-y-6 flex-1 ${isSimulationMode ? 'border-r border-white/5' : ''}`}>

          {/* ── Buy / Sell ── */}
          {isEditMode ? (
            <div className="flex p-1 bg-white/5 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <div className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center text-blue-400 bg-blue-500/10 tracking-widest">
                SOBRESCRIBIR POSICIÓN
              </div>
            </div>
          ) : (
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
          )}

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
                onChange={e => {
                  const newType = e.target.value as any;
                  setAssetType(newType);
                }}
                className="glass-input cursor-pointer"
              >
                <option value="Renta Variable">Renta Variable (Acciones/ETFs)</option>
                <option value="Criptomonedas">Criptomonedas</option>
                <option value="Renta Fija">Renta Fija (CETES/Bonos)</option>
                <option value="Divisas">Divisas (Cash/Forex)</option>
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
                step={assetType === 'Criptomonedas' ? '0.00000001' : '0.01'}
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
                step={assetType === 'Criptomonedas' ? '0.00000001' : '0.01'}
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
                step="0.01"
                value={commission}
                onChange={e => setCommission(e.target.value === '' ? '' : Number(e.target.value))}
                className="glass-input"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* ── Date and Thesis ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase ml-1">
                Tesis de Inversión (Opcional)
              </label>
              <input
                type="text"
                value={thesis}
                onChange={e => setThesis(e.target.value)}
                placeholder="Razón de la operación..."
                className="glass-input w-full"
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
              disabled={showBalanceWarning || numShares <= 0 || numPrice <= 0 || isSubmitting}
              onClick={handleConfirm}
              className={`glass-button w-full shadow-[0_0_20px_rgba(26,92,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${isSimulationMode ? 'bg-transparent border-primary/50 text-primary hover:bg-primary/10' : ''}`}
            >
              {isSubmitting ? (
                <RefreshCcw className="w-5 h-5 animate-spin mx-auto" />
              ) : isSuccess ? (
                <span className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  {isEditMode ? '¡Cambios Guardados!' : '¡Operación Registrada!'}
                </span>
              ) : isSimulationMode ? (
                'Modo Simulación Activo (Solo Vista)'
              ) : isEditMode ? (
                'Guardar Cambios'
              ) : (
                'Confirmar y Registrar Operación'
              )}
            </button>
          </div>

          {/* ── Simulation Donut ── */}
          {isSimulationMode && (
            <div className="flex-1 p-8 bg-black/20 flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="text-sm text-primary font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
                 <Calculator className="w-4 h-4" /> Proyección de Asignación
              </h3>
              <div className="w-full h-full max-h-[400px]">
                 <AllocationDonut customPortfolio={getSimulatedPortfolio()} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTransactionModal;
