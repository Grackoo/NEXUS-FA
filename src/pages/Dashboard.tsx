import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { deletePosition } from '../services/sheetsService';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  List,
  Coins,
  Landmark,
  Activity,
  Layers,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import SmartTransactionModal, { type EditAsset } from '../components/SmartTransactionModal';

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
const CATEGORIES = ['All', 'Renta Variable', 'Criptomonedas', 'Renta Fija', 'Liquidez'];

// ─── Asset Logo Helper ───────────────────────────────────────────────────────
export const cleanTickerName = (ticker: string) => ticker.replace(/(STOCKS|ETFS|CRYPTO|FIBRAS|COMMODITIES|FOREX|EQUITY|INC)$/i, '').trim();

const AssetLogo: React.FC<{ ticker: string; logoUrl?: string; className?: string }> = ({ ticker, logoUrl, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const cleanTicker = cleanTickerName(ticker).toUpperCase();
  const firstLetter = cleanTicker.charAt(0);

  const colors = ['#1A5CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  const colorHex = colors[firstLetter.charCodeAt(0) % colors.length] || colors[0];

  // Hardcoded mappings for common Mexican/Global tickers that APIs miss
  const customLogos: Record<string, string> = {
    'VOO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Vanguard_Group_logo.svg/1024px-Vanguard_Group_logo.svg.png',
    'CETES': 'https://www.cetesdirecto.com/sites/portal/o/cetesdirecto/assets/images/logo_cetesdirecto.png',
    'FUNO11': 'https://funo.mx/assets/img/funo-logo.svg',
    'GLD': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/SPDR_Gold_Shares_logo.svg/1200px-SPDR_Gold_Shares_logo.svg.png',
    'USD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png',
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'AAPL': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'NVDA': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg'
  };

  // Try custom mapping first, then try companiesmarketcap API, then fallback to clearbit
  const finalLogoUrl = logoUrl || customLogos[cleanTicker] || `https://companiesmarketcap.com/img/company-logos/64/${cleanTicker}.webp`;

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
  const { clientPortfolio, refreshPortfolio } = usePortfolio();
  const { currency, exchangeRate, formatValue, convertToView } = useCurrency();
  const { user } = useAuth();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<EditAsset | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ ticker: string; assetType: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayedPortfolio =
    selectedCategory === 'All'
      ? clientPortfolio
      : clientPortfolio.filter(a => a.type === selectedCategory);

  let globalCostBasisView = 0;
  let globalCurrentView = 0;

  displayedPortfolio.forEach(asset => {
    const currentValueMXN = asset.sharesOwned * asset.realTimePrice;
    const valueInView = convertToView(currentValueMXN, 'MXN');
    const avgPriceInView = currency === 'USD' ? asset.avgPurchasePriceUSD : asset.avgPurchasePriceMXN;
    const costBasisInView = asset.sharesOwned * avgPriceInView;

    globalCurrentView += valueInView;
    globalCostBasisView += costBasisInView;
  });

  const netWorth = globalCurrentView;
  const globalPL = globalCurrentView - globalCostBasisView;
  const globalPLPercent = globalCostBasisView > 0 ? (globalPL / globalCostBasisView) * 100 : 0;
  const isGlobalPositive = globalPL >= 0;

  const allocation = displayedPortfolio.reduce((acc: any[], asset) => {
    const existing = acc.find(item => item.name === asset.type);
    const val = convertToView(asset.sharesOwned * asset.realTimePrice, 'MXN');
    if (existing) existing.value += val;
    else acc.push({ name: asset.type, value: val });
    return acc;
  }, []);

  const COLORS = ['#1A5CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

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

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-10 space-y-6 md:space-y-8 animate-fade-in">

        {/* ── Header cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card flex flex-col justify-between overflow-hidden relative p-8 md:p-10 bg-slate-900/50 backdrop-blur-md border border-white/5 shadow-2xl rounded-3xl">
            <div className="relative z-10 space-y-2">
              <p className="text-xs uppercase tracking-wide font-medium text-white/60 mb-2">Balance Total</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 tabular-nums text-white">
                {formatValue(netWorth)}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border ${isGlobalPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {isGlobalPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isGlobalPositive ? '+' : ''}{globalPLPercent.toFixed(2)}%
                </div>
                <div className="flex flex-col ml-2">
                  <p className="text-[10px] uppercase tracking-wide font-medium text-white/50">
                    Rendimiento Histórico
                  </p>
                  <p className={`text-sm font-semibold ${isGlobalPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isGlobalPositive ? '+' : ''}{formatValue(globalPL)}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent flex items-center justify-end pr-4 md:pr-8">
              <TrendingUp className="w-20 h-20 md:w-32 md:h-32 text-primary/10 rotate-12" />
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wide font-medium text-white/60 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" /> Asignación (Allocation)
              </h3>
            </div>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={4}>
                    {allocation.map((_: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                      boxShadow: '0 10px 15px rgba(0,0,0,0.5)', padding: '8px',
                    }}
                    itemStyle={{ color: '#fff', fontSize: '11px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <p className="text-[10px] text-white/50 uppercase tracking-widest">Activos</p>
                <p className="text-2xl font-semibold text-white mt-1">{allocation.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Category Tabs ── */}
        <section className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {CATEGORIES.map(category => {
            const isActive = selectedCategory === category;
            const labelMapping: Record<string, string> = {
              'All': 'Todos los Activos', 'Renta Variable': 'Renta Variable',
              'Criptomonedas': 'Criptomonedas', 'Renta Fija': 'Renta Fija',
              'Liquidez': 'Liquidez'
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
              <button className="glass-button secondary px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs">
                Exportar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[780px] md:min-w-0">
              <thead>
                <tr className="border-b border-white/5 text-white/50 text-[10px] md:text-[11px] uppercase tracking-widest bg-white/[0.01]">
                  <th className="px-6 py-4 font-semibold">Activo</th>
                  <th className="px-4 py-4 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-4 font-semibold text-right">Precio Prom.</th>
                  <th className="px-4 py-4 font-semibold text-right">V. Mercado</th>
                  <th className="px-4 py-4 font-semibold text-right">Ganancia</th>
                  <th className="px-4 py-4 font-semibold text-right">Rend.</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedPortfolio.map(asset => {
                  const oppositeCurrency = currency === 'USD' ? 'MXN' : 'USD';
                  
                  // realTimePrice from Google Sheets is now ALWAYS in MXN
                  const currentValueMXN = asset.sharesOwned * asset.realTimePrice;
                  const valueInUSD = currentValueMXN / exchangeRate;
                  
                  const valueMain = currency === 'USD' ? valueInUSD : currentValueMXN;
                  const valueSub = currency === 'USD' ? currentValueMXN : valueInUSD;
                  
                  // Use the explicit avg purchase prices from the backend
                  const avgMain = currency === 'USD' ? asset.avgPurchasePriceUSD : asset.avgPurchasePriceMXN;
                  const avgSub = currency === 'USD' ? asset.avgPurchasePriceMXN : asset.avgPurchasePriceUSD;
                  
                  const costBasisMain = asset.sharesOwned * avgMain;
                  const costBasisSub = asset.sharesOwned * avgSub;

                  const plMain = valueMain - costBasisMain;
                  const plSub = valueSub - costBasisSub;
                  
                  // Avoid Division by 0 (Infinity%) if costBasis is 0 or missing
                  const plPercentageMain = costBasisMain > 0 ? (plMain / costBasisMain) * 100 : 0;
                  const plPercentageSub = costBasisSub > 0 ? (plSub / costBasisSub) * 100 : 0;
                  
                  const isPositiveMain = plMain >= 0;
                  const isPositiveSub = plSub >= 0;

                  return (
                    <tr key={asset.ticker} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                      {/* Asset info */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/30 transition-all duration-300">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AssetLogo ticker={asset.ticker} logoUrl={asset.logoUrl} />
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

                      {/* Actions: Edit + Delete */}
                      <td className="px-6 py-3 text-center">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(asset)}
                            className="action-btn edit"
                            title={`Editar posición de ${asset.ticker}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget({ ticker: asset.ticker, assetType: asset.type })}
                            className="action-btn"
                            title={`Eliminar posición de ${asset.ticker}`}
                            style={{
                              color: 'rgba(239,68,68,0.7)',
                              borderColor: 'rgba(239,68,68,0.2)',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--crimson)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.35)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
