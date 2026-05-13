import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { deletePosition } from '../services/sheetsService';
import {
  TrendingUp,
  TrendingDown,
  List,
  Coins,
  Landmark,
  Activity,
  Layers,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import SmartTransactionModal, { type EditAsset } from '../components/SmartTransactionModal';
import EditSingleOperationModal from '../components/EditSingleOperationModal';
import { PerformanceArea } from '../components/charts/PerformanceArea';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { PortfolioHealthDashboard } from '../components/charts/PortfolioHealthDashboard';
import NexusLoadingScreen from '../components/NexusLoadingScreen';
import GoalTracker from '../components/GoalTracker';
import AcademyCarousel from '../components/AcademyCarousel';
import DocumentVault from '../components/DocumentVault';
import TaxHelper from '../components/TaxHelper';

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
interface DeleteConfirmProps {
  ticker: string;
  assetType: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({
  ticker,
  assetType,
  onConfirm,
  onCancel,
  isDeleting,
}) => (
  <div className="modal-overlay animate-fade-in">
    <div
      className="glass-card w-full max-w-md p-0 overflow-hidden"
      style={{ border: '1px solid rgba(239,68,68,0.25)' }}
    >
      {/* Red gradient header bar */}
      <div
        style={{
          height: '4px',
          background: 'linear-gradient(90deg, #EF4444, #F87171)',
        }}
      />

      <div className="p-8 space-y-6">
        {/* Icon + title */}
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertTriangle className="w-6 h-6 text-crimson" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">
              ¿Eliminar posición?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Posición: <span className="text-white font-bold">{ticker}</span>
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase tracking-wider">{assetType}</span>
            </p>
          </div>
        </div>

        {/* Warning message */}
        <div
          className="p-4 rounded-xl space-y-2"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <p className="text-sm font-semibold text-white leading-relaxed">
            ¿Está seguro de que desea eliminar esta posición?
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Al eliminar esta posición, se eliminarán todas las transacciones
            asociadas a <span className="text-white font-bold">{ticker}</span> en el registro.
            <span className="block mt-1 font-semibold text-crimson/80">Esta acción no se puede deshacer.</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="glass-button secondary flex-1 py-3 text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: isDeleting ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.85)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: 'white',
              boxShadow: isDeleting ? 'none' : '0 0 20px rgba(239,68,68,0.35)',
            }}
          >
            {isDeleting ? (
              <><RefreshCcw className="w-4 h-4 animate-spin" /> Eliminando...</>
            ) : (
              <><Trash2 className="w-4 h-4" /> Sí, eliminar</>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Available categories ─────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Renta Variable', 'Criptomonedas', 'Renta Fija', 'Divisas'];

// ─── Asset Logo Helper ───────────────────────────────────────────────────────
export const cleanTickerName = (ticker: string) => ticker.replace(/(STOCKS|ETFS|CRYPTO|FIBRAS|COMMODITIES|FOREX|EQUITY|INC)$/i, '').trim();

const AssetLogo: React.FC<{ ticker: string; logoUrl?: string; type?: string; className?: string }> = ({ ticker, logoUrl, type, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const cleanTicker = cleanTickerName(ticker).toUpperCase();
  const firstLetter = cleanTicker.charAt(0);

  const colors = ['#1A5CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  const colorHex = colors[firstLetter.charCodeAt(0) % colors.length] || colors[0];

  const getLogoUrl = () => {
    if (logoUrl && logoUrl.trim() !== '') return logoUrl;

    // 1. Crypto using Github Raw (Reliable, no hotlink block)
    if (type === 'Criptomonedas') {
      return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanTicker.toLowerCase()}.png`;
    }

    // 2. Forex / Liquidez using SVG Flags
    if (type === 'Liquidez') {
      if (cleanTicker === 'USD') return 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/us.svg';
      if (cleanTicker === 'MXN') return 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/mx.svg';
      if (cleanTicker === 'EUR') return 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/eu.svg';
    }

    // 3. Known Mappings for Google Favicon API
    // Google Favicon NEVER blocks hotlinking, is extremely fast, and never 404s.
    const tickerToDomain: Record<string, string> = {
      'AAPL': 'apple.com',
      'NVDA': 'nvidia.com',
      'MSFT': 'microsoft.com',
      'TSLA': 'tesla.com',
      'AMZN': 'amazon.com',
      'META': 'meta.com',
      'GOOGL': 'google.com',
      'GOOG': 'google.com',
      'VOO': 'vanguard.com',
      'QQQ': 'invesco.com',
      'SPY': 'ssga.com',
      'IVV': 'ishares.com',
      'CETES': 'cetesdirecto.com',
      'FUNO11': 'funo.mx',
      'FIBRAPL14': 'fibraprologis.com',
      'FMTY14': 'fibramty.com',
      'DANHOS13': 'fibradanhos.com.mx',
      'GLD': 'spdrgoldshares.com',
      'SLV': 'ishares.com',
      'BNO': 'uscofund.com'
    };

    if (tickerToDomain[cleanTicker]) {
      return `https://www.google.com/s2/favicons?domain=${tickerToDomain[cleanTicker]}&sz=128`;
    }

    // 4. Fallback for any other stock: assume ticker.com
    return `https://www.google.com/s2/favicons?domain=${cleanTicker.toLowerCase()}.com&sz=128`;
  };

  const finalLogoUrl = getLogoUrl();

  if (hasError || !finalLogoUrl) {
    return (
      <div 
        className={`flex items-center justify-center text-white font-bold text-xs ${className}`}
        style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: colorHex, outline: '2px solid rgba(255,255,255,0.1)' }}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img 
      src={finalLogoUrl} 
      alt={`${cleanTicker} logo`} 
      className={className}
      style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover', backgroundColor: '#fff', outline: '2px solid rgba(255,255,255,0.1)' }}
      onError={() => setHasError(true)} 
    />
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { clientPortfolio, clientOperations, refreshPortfolio } = usePortfolio();
  const { currency, exchangeRate, formatValue, convertToView } = useCurrency();
  const { user } = useAuth();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<EditAsset | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ ticker: string; assetType: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded row state
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  
  // Single Operation Edit State
  const [editSingleOpTarget, setEditSingleOpTarget] = useState<{ op: any; index: number } | null>(null);

  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    return !sessionStorage.getItem('hasSeenNexusLoading');
  });

  const displayedPortfolio =
    selectedCategory === 'All'
      ? clientPortfolio
      : clientPortfolio.filter(a => a.type === selectedCategory);

  let globalCostBasisView = 0;
  let globalCurrentView = 0;

  displayedPortfolio.forEach(asset => {
    // Determine the average cost in MXN (compute if missing)
    let avgNativeMXN = asset.avgPurchasePriceMXN;
    if (!avgNativeMXN && asset.avgPurchasePriceUSD) avgNativeMXN = asset.avgPurchasePriceUSD * exchangeRate;
    if (!avgNativeMXN) avgNativeMXN = 0; // Fallback

    // Determine current market price in MXN
    const currentPriceMXN = asset.nativeCurrency === 'USD' ? asset.realTimePrice * exchangeRate : asset.realTimePrice;
    const currentValueMXN = asset.sharesOwned * currentPriceMXN;
    
    // Convert to view
    const valueInView = convertToView(currentValueMXN, 'MXN');
    const avgPriceInView = currency === 'USD' ? (avgNativeMXN / exchangeRate) : avgNativeMXN;
    const costBasisInView = asset.sharesOwned * avgPriceInView;

    globalCurrentView += valueInView;
    globalCostBasisView += costBasisInView;
  });

  const netWorth = globalCurrentView;
  const globalPL = globalCurrentView - globalCostBasisView;
  const globalPLPercent = globalCostBasisView > 0 ? (globalPL / globalCostBasisView) * 100 : 0;
  const isGlobalPositive = globalPL >= 0;

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Renta Variable': return <Activity className="w-5 h-5" />;
      case 'Criptomonedas':  return <Coins className="w-5 h-5" />;
      case 'Renta Fija':     return <Landmark className="w-5 h-5" />;
      case 'Liquidez':       return <Layers className="w-5 h-5" />;
      default:               return <Activity className="w-5 h-5" />;
    }
  };

  const handleOpenEdit = (asset: any) => {
    setEditAsset({
      ticker: asset.ticker,
      type: asset.type,
      sharesOwned: asset.sharesOwned,
      avgPurchasePriceUSD: asset.avgPurchasePriceUSD,
      avgPurchasePriceMXN: asset.avgPurchasePriceMXN,
      nativeCurrency: asset.nativeCurrency,
    });
    setIsTxModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTxModalOpen(false);
    setEditAsset(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setIsDeleting(true);
    await deletePosition(user.id, deleteTarget.ticker, deleteTarget.assetType);
    await refreshPortfolio();
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (showLoadingScreen) {
    return (
      <NexusLoadingScreen 
        onComplete={() => {
          sessionStorage.setItem('hasSeenNexusLoading', 'true');
          setShowLoadingScreen(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-10 space-y-6 md:space-y-8 animate-fade-in">

        {/* ── Header cards ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1 glass-card flex flex-col justify-between overflow-hidden relative p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 shadow-2xl rounded-3xl">
            <div className="relative z-10 space-y-2">
              <p className="text-xs uppercase tracking-wide font-medium text-white/60 mb-2">Balance Total</p>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 tabular-nums text-white break-words">
                {formatValue(netWorth)}
              </h1>
              <div className="flex flex-col gap-4 mt-6">
                <div className={`inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${isGlobalPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {isGlobalPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isGlobalPositive ? '+' : ''}{globalPLPercent.toFixed(2)}%
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] uppercase tracking-wide font-medium text-white/50">
                    Rendimiento Histórico
                  </p>
                  <p className={`text-sm font-semibold ${isGlobalPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isGlobalPositive ? '+' : ''}{formatValue(globalPL)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <PerformanceArea />
          </div>

          <div className="lg:col-span-1">
            <AllocationDonut />
          </div>

          <div className="lg:col-span-1">
            <GoalTracker />
          </div>
        </section>

        {/* ── Academy Widget ── */}
        <section className="w-full">
          <AcademyCarousel />
        </section>

        {/* ── Portfolio Health Dashboard ── */}
        <section className="w-full">
          <PortfolioHealthDashboard />
        </section>

        {/* ── Document Vault ── */}
        <section className="w-full">
          <DocumentVault />
        </section>

        {/* ── Category Tabs ── */}
        <section className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {CATEGORIES.map(category => {
            const isActive = selectedCategory === category;
            const labelMapping: Record<string, string> = {
              'All': 'Todos los Activos', 'Renta Variable': 'Renta Variable',
              'Criptomonedas': 'Criptomonedas', 'Renta Fija': 'Renta Fija',
              'Divisas': 'Divisas'
            };
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  refreshPortfolio();
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(26,92,255,0.4)]'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                }`}
              >
                {labelMapping[category]}
              </button>
            );
          })}
        </section>

        {/* ── Positions Table ── */}
        <section className="glass-card p-0 overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl">
          <div className="px-6 md:px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h3 className="text-sm uppercase tracking-wide font-medium text-white/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <List className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              Posiciones Actuales {selectedCategory !== 'All' && <span>— {selectedCategory}</span>}
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => { setEditAsset(undefined); setIsTxModalOpen(true); }}
                className="glass-button flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Operar {selectedCategory !== 'All' ? selectedCategory : ''}
              </button>
              <TaxHelper />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[780px] md:min-w-0">
              <thead>
                <tr className="border-b border-white/5 text-white/50 text-[10px] md:text-[11px] uppercase tracking-widest bg-white/[0.01]">
                  <th className="px-6 py-4 font-semibold">Activo</th>
                  <th className="px-4 py-4 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-4 font-semibold text-right">Precio Prom.</th>
                  <th className="px-4 py-4 font-semibold text-right">Target</th>
                  <th className="px-4 py-4 font-semibold text-right">Take Profit</th>
                  <th className="px-4 py-4 font-semibold text-right">Stop Loss</th>
                  <th className="px-4 py-4 font-semibold text-right">V. Mercado</th>
                  <th className="px-4 py-4 font-semibold text-right">Ganancia</th>
                  <th className="px-4 py-4 font-semibold text-right">Rend.</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedPortfolio.map(asset => {
                  const oppositeCurrency = currency === 'USD' ? 'MXN' : 'USD';
                  
                  // 1. Resolve missing avg prices dynamically based on exchange rate
                  let avgNativeUSD = asset.avgPurchasePriceUSD;
                  let avgNativeMXN = asset.avgPurchasePriceMXN;
                  if (!avgNativeUSD && avgNativeMXN) avgNativeUSD = avgNativeMXN / exchangeRate;
                  if (!avgNativeMXN && avgNativeUSD) avgNativeMXN = avgNativeUSD * exchangeRate;
                  
                  // 2. Real Time Price is strictly in nativeCurrency
                  let currentPriceUSD = 0;
                  let currentPriceMXN = 0;
                  if (asset.nativeCurrency === 'USD') {
                    currentPriceUSD = asset.realTimePrice;
                    currentPriceMXN = asset.realTimePrice * exchangeRate;
                  } else {
                    currentPriceMXN = asset.realTimePrice;
                    currentPriceUSD = asset.realTimePrice / exchangeRate;
                  }

                  const currentValueUSD = asset.sharesOwned * currentPriceUSD;
                  const currentValueMXN = asset.sharesOwned * currentPriceMXN;

                  // 3. Assign Main and Sub based on Dashboard selected `currency`
                  const valueMain = currency === 'USD' ? currentValueUSD : currentValueMXN;
                  const valueSub = currency === 'USD' ? currentValueMXN : currentValueUSD;

                  const avgMain = currency === 'USD' ? avgNativeUSD : avgNativeMXN;
                  const avgSub = currency === 'USD' ? avgNativeMXN : avgNativeUSD;

                  const costBasisMain = asset.sharesOwned * avgMain;
                  const costBasisSub = asset.sharesOwned * avgSub;

                  const plMain = valueMain - costBasisMain;
                  const plSub = valueSub - costBasisSub;
                  
                  // Avoid Division by 0
                  const plPercentageMain = costBasisMain > 0 ? (plMain / costBasisMain) * 100 : 0;
                  const plPercentageSub = costBasisSub > 0 ? (plSub / costBasisSub) * 100 : 0;

                  const isPositiveMain = plMain >= 0;
                  const isPositiveSub = plSub >= 0;

                  return (
                    <React.Fragment key={asset.ticker}>
                      <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                        {/* Asset info */}
                        <td className="px-6 py-3 cursor-pointer" onClick={() => setExpandedTicker(expandedTicker === asset.ticker ? null : asset.ticker)}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/30 transition-all duration-300">
                              {getAssetIcon(asset.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <AssetLogo ticker={asset.ticker} logoUrl={asset.logoUrl} type={asset.type} />
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm tracking-tight text-white">{cleanTickerName(asset.ticker)}</p>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-medium uppercase tracking-wider">
                                    {asset.type}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{asset.nativeCurrency}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-sm text-white">{asset.sharesOwned}</td>
                        
                        {/* Avg Price */}
                        <td className="px-4 py-3 text-right tabular-nums text-white/60 text-sm">
                          <div className="flex flex-col gap-1 items-end">
                            <span>{formatValue(avgMain)}</span>
                            {avgSub > 0 && <span className="text-[10px] text-white/40 font-medium">{formatValue(avgSub, oppositeCurrency)}</span>}
                          </div>
                        </td>
                        
                        {/* Target Price */}
                        {(() => {
                          const targetPrice = asset.target;
                          const currentPrice = asset.nativeCurrency === 'USD' ? currentPriceUSD : currentPriceMXN;
                          const isNearTarget = targetPrice ? Math.abs(currentPrice - targetPrice) / targetPrice <= 0.05 : false;
                          return (
                            <td className={`px-4 py-3 text-right tabular-nums text-sm transition-all duration-300 ${isNearTarget ? 'animate-pulse bg-primary/10 shadow-[inset_0_0_15px_rgba(26,92,255,0.4)] border-x border-primary/30' : ''}`}>
                              {targetPrice ? (
                                <span className={isNearTarget ? 'text-primary-glow font-bold' : 'text-white/80 font-semibold'}>
                                  {formatValue(targetPrice, asset.nativeCurrency)}
                                </span>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </td>
                          );
                        })()}

                        {/* Take Profit */}
                        {(() => {
                          const tpPrice = asset.takeProfit;
                          const currentPrice = asset.nativeCurrency === 'USD' ? currentPriceUSD : currentPriceMXN;
                          const isNearTP = tpPrice ? Math.abs(currentPrice - tpPrice) / tpPrice <= 0.05 : false;
                          return (
                            <td className={`px-4 py-3 text-right tabular-nums text-sm transition-all duration-300 ${isNearTP ? 'animate-pulse bg-emerald-500/10 shadow-[inset_0_0_15px_rgba(16,185,129,0.4)] border-x border-emerald-500/30' : ''}`}>
                              {tpPrice ? (
                                <span className={isNearTP ? 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-white/80 font-semibold'}>
                                  {formatValue(tpPrice, asset.nativeCurrency)}
                                </span>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </td>
                          );
                        })()}

                        {/* Stop Loss */}
                        {(() => {
                          const slPrice = asset.stopLoss;
                          const currentPrice = asset.nativeCurrency === 'USD' ? currentPriceUSD : currentPriceMXN;
                          const isNearSL = slPrice ? Math.abs(currentPrice - slPrice) / slPrice <= 0.05 : false;
                          return (
                            <td className={`px-4 py-3 text-right tabular-nums text-sm transition-all duration-300 ${isNearSL ? 'animate-pulse bg-rose-500/10 shadow-[inset_0_0_15px_rgba(244,63,94,0.4)] border-x border-rose-500/30' : ''}`}>
                              {slPrice ? (
                                <span className={isNearSL ? 'text-rose-400 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-white/80 font-semibold'}>
                                  {formatValue(slPrice, asset.nativeCurrency)}
                                </span>
                              ) : (
                                <span className="text-white/40">-</span>
                              )}
                            </td>
                          );
                        })()}
                        
                        {/* Market Value */}
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-sm text-white">
                          <div className="flex flex-col gap-1 items-end">
                            <span>{formatValue(valueMain)}</span>
                            <span className="text-[10px] text-white/40 font-medium">{formatValue(valueSub, oppositeCurrency)}</span>
                          </div>
                        </td>

                        {/* Profit/Loss */}
                        <td className={`px-4 py-3 text-right font-semibold tabular-nums text-sm`}>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={isPositiveMain ? 'text-emerald-400' : 'text-rose-400'}>{isPositiveMain ? '+' : ''}{formatValue(plMain)}</span>
                            <span className={`text-[10px] font-medium ${isPositiveSub ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>{isPositiveSub ? '+' : ''}{formatValue(plSub, oppositeCurrency)}</span>
                          </div>
                        </td>

                        {/* Return (PlPercentage) */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col gap-1.5 items-end">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs ${isPositiveMain ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {isPositiveMain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {plPercentageMain.toFixed(1)}%
                            </div>
                            {avgSub > 0 && (
                              <div className={`inline-flex items-center gap-1 text-[10px] font-semibold ${isPositiveSub ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>
                                {isPositiveSub ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{plPercentageSub.toFixed(1)}% {oppositeCurrency}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 text-center">
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => setExpandedTicker(expandedTicker === asset.ticker ? null : asset.ticker)}
                              className="action-btn text-gray-400 border-white/5 hover:bg-white/5"
                              title="Ver historial de operaciones"
                            >
                              {expandedTicker === asset.ticker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleOpenEdit(asset)}
                              className="action-btn edit"
                              title={`Ajustar posición de ${asset.ticker}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteTarget({ ticker: asset.ticker, assetType: asset.type })}
                              className="action-btn text-rose-500/70 border-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30"
                              title={`Eliminar posición de ${asset.ticker}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Operations Row */}
                      {expandedTicker === asset.ticker && (
                        <tr className="bg-black/20 border-b border-white/5">
                          <td colSpan={10} className="p-0">
                            <div className="p-6">
                              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-400" /> Historial de Operaciones
                              </h4>
                              {clientOperations.filter(op => op.ticker === asset.ticker).length === 0 ? (
                                <p className="text-sm text-gray-500">No hay operaciones registradas individualmente.</p>
                              ) : (
                                <div className="space-y-2">
                                  {clientOperations
                                    .filter(op => op.ticker === asset.ticker)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((op, idx) => {
                                      const isBuy = op.type === 'Buy' || op.type === 'Compra';
                                      const isSell = op.type === 'Sell' || op.type === 'Venta';
                                      return (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]">
                                          <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : isSell ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                              {isBuy ? <TrendingUp className="w-4 h-4" /> : isSell ? <TrendingDown className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                            </div>
                                            <div>
                                              <p className="font-semibold text-sm text-white">{op.type}</p>
                                              <p className="text-[10px] text-gray-400">{new Date(op.date).toLocaleDateString()}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-right">
                                            <div>
                                              <p className="font-semibold text-sm text-white">
                                                {isBuy ? '+' : isSell ? '-' : ''}{op.shares} Acciones
                                              </p>
                                              <p className="text-[10px] text-gray-400">
                                                Precio: {formatValue(op.price, op.currency as 'USD' | 'MXN')}
                                              </p>
                                            </div>
                                            <button 
                                              onClick={() => setEditSingleOpTarget({ op, index: idx })}
                                              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                                              title="Editar Operación"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Transaction Modal (Nueva Operación / Editar) ── */}
      {isTxModalOpen && user && (
        <SmartTransactionModal
          isOpen={isTxModalOpen}
          onClose={handleCloseModal}
          clientId={user.id}
          clientName={user.name}
          defaultAssetType={selectedCategory as any}
          editAsset={editAsset}
        />
      )}

      {/* ── Edit Single Operation Modal ── */}
      <EditSingleOperationModal
        isOpen={!!editSingleOpTarget}
        onClose={() => setEditSingleOpTarget(null)}
        operationToEdit={editSingleOpTarget?.op || null}
        operationIndex={editSingleOpTarget?.index ?? -1}
      />

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          ticker={deleteTarget.ticker}
          assetType={deleteTarget.assetType}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Dashboard;
