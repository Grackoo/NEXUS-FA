import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdvisorNotes } from '../hooks/useAdvisorNotes';
import { deletePosition, deleteSingleOperation } from '../services/sheetsService';
import toast from 'react-hot-toast';
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
  MessageSquareQuote,
  X,
  Search,
  Wallet,
  BarChart3,
  Brain,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import SmartTransactionModal, { type EditAsset } from '../components/SmartTransactionModal';
import EditSingleOperationModal from '../components/EditSingleOperationModal';
import { PerformanceArea } from '../components/charts/PerformanceArea';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { PortfolioHealthDashboard } from '../components/charts/PortfolioHealthDashboard';
import NexusLoadingScreen from '../components/NexusLoadingScreen';
import GoalTracker from '../components/GoalTracker';
import AcademyCarousel from '../components/AcademyCarousel';
import RecentActivityFeed from '../components/RecentActivityFeed';
import ExecutiveSummary from '../components/ExecutiveSummary';
import DocumentVault from '../components/DocumentVault';
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

// ─── Delete Single Operation Confirmation Modal ──────────────────────────────
interface DeleteSingleOpConfirmProps {
  op: any;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  formatValue: (val: number, cur?: 'USD' | 'MXN') => string;
}

const DeleteSingleOpConfirmModal: React.FC<DeleteSingleOpConfirmProps> = ({
  op,
  onConfirm,
  onCancel,
  isDeleting,
  formatValue,
}) => {
  if (!op) return null;
  const isBuy = op.type === 'Buy' || op.type === 'Compra';
  const isSell = op.type === 'Sell' || op.type === 'Venta';
  const totalAmount = (Number(op.shares) || 0) * (Number(op.price) || 0);

  return (
    <div className="modal-overlay animate-fade-in z-[110]">
      <div
        className="glass-card w-full max-w-md p-0 overflow-hidden"
        style={{ border: '1px solid rgba(239,68,68,0.3)' }}
      >
        {/* Red gradient header bar */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #EF4444, #F87171)',
          }}
        />

        <div className="p-6 md:p-8 space-y-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-white">
                ¿Eliminar esta operación?
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Activo: <span className="text-white font-bold">{op.ticker}</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300 uppercase tracking-wider">{op.type}</span>
              </p>
            </div>
          </div>

          {/* Operation Details Card */}
          <div className="p-4 rounded-xl space-y-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Fecha:</span>
              <span className="text-white font-medium">{new Date(op.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Tipo:</span>
              <span className={`font-semibold ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-blue-400'}`}>
                {op.type}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Cantidad:</span>
              <span className="text-white font-semibold">{op.shares} títulos / unidades</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Precio unitario:</span>
              <span className="text-white font-medium">{formatValue(op.price, op.currency as 'USD' | 'MXN')}</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Importe total:</span>
              <span className="text-white font-bold">{formatValue(totalAmount, op.currency as 'USD' | 'MXN')}</span>
            </div>
          </div>

          {/* Warning message */}
          <div
            className="p-3.5 rounded-xl space-y-1"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <p className="text-xs font-semibold text-rose-300 leading-relaxed">
              Solo se eliminará esta operación individual.
            </p>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Las demás operaciones de <strong className="text-white">{op.ticker}</strong> permanecerán intactas y la posición de tu portafolio se recalculará automáticamente.
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
                background: isDeleting ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.85)',
                border: '1px solid rgba(239,68,68,0.5)',
                color: 'white',
                boxShadow: isDeleting ? 'none' : '0 0 20px rgba(239,68,68,0.35)',
              }}
            >
              {isDeleting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar Operación'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const { clientPortfolio, clientOperations, refreshPortfolio, estimatedAnnualDividendsUSD } = usePortfolio();
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

  // Single Operation Delete State
  const [deleteSingleOpTarget, setDeleteSingleOpTarget] = useState<{ op: any; index: number; assetType: string } | null>(null);
  const [isDeletingSingleOp, setIsDeletingSingleOp] = useState(false);

  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    return !sessionStorage.getItem('hasSeenNexusLoading');
  });

  const { getNote } = useAdvisorNotes();
  const clientNoteData = user ? getNote(user.id) : null;
  const [showNoteAlert, setShowNoteAlert] = useState(false);

  React.useEffect(() => {
    if (clientNoteData && !clientNoteData.isRead && !showLoadingScreen && !sessionStorage.getItem(`hasSeenNoteAlert_${user?.id}`)) {
      setShowNoteAlert(true);
    }
  }, [clientNoteData, showLoadingScreen, user?.id]);

  const handleDismissNoteAlert = () => {
    setShowNoteAlert(false);
    if (user) {
      sessionStorage.setItem(`hasSeenNoteAlert_${user.id}`, 'true');
    }
  };

  type TabType = 'positions' | 'analytics' | 'strategy' | 'activity' | 'vault';
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Consolidated Portfolio Metrics across ALL assets
  let globalCostBasisView = 0;
  let globalCurrentView = 0;

  clientPortfolio.forEach(asset => {
    let avgNativeMXN = asset.avgPurchasePriceMXN;
    if (!avgNativeMXN && asset.avgPurchasePriceUSD) avgNativeMXN = asset.avgPurchasePriceUSD * exchangeRate;
    if (!avgNativeMXN) avgNativeMXN = 0;

    const currentPriceMXN = asset.nativeCurrency === 'USD' ? asset.realTimePrice * exchangeRate : asset.realTimePrice;
    const currentValueMXN = asset.sharesOwned * currentPriceMXN;
    
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

  const oppositeCurrency = currency === 'USD' ? 'MXN' : 'USD';
  const oppositeNetWorth = currency === 'USD' ? (netWorth * exchangeRate) : (netWorth / exchangeRate);
  const dividendsView = currency === 'USD' ? estimatedAnnualDividendsUSD : estimatedAnnualDividendsUSD * exchangeRate;
  const dividendYieldPercent = netWorth > 0 ? (dividendsView / netWorth) * 100 : 0;

  // 2. Filtered portfolio for positions table
  const displayedPortfolio = clientPortfolio.filter(asset => {
    const matchesCategory = selectedCategory === 'All' || asset.type === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleanTickerName(asset.ticker).toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts: Record<string, number> = {
    'All': clientPortfolio.length,
    'Renta Variable': clientPortfolio.filter(a => a.type === 'Renta Variable').length,
    'Criptomonedas': clientPortfolio.filter(a => a.type === 'Criptomonedas').length,
    'Renta Fija': clientPortfolio.filter(a => a.type === 'Renta Fija').length,
    'Divisas': clientPortfolio.filter(a => a.type === 'Divisas').length,
  };

  const TABS = [
    { id: 'positions' as TabType, label: 'Portafolio & Posiciones', icon: <Wallet className="w-4 h-4" />, count: clientPortfolio.length },
    { id: 'analytics' as TabType, label: 'Inteligencia Financiera', icon: <BarChart3 className="w-4 h-4" />, badge: 'Pro' },
    { id: 'strategy' as TabType, label: 'Estrategia & Nexus IA', icon: <Brain className="w-4 h-4" />, badge: 'AI' },
    { id: 'activity' as TabType, label: 'Actividad & Auditoría', icon: <History className="w-4 h-4" />, count: clientOperations.length },
    { id: 'vault' as TabType, label: 'Bóveda & Fiscalidad', icon: <FileText className="w-4 h-4" /> },
  ];

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

  const handleConfirmDeleteSingleOp = async () => {
    if (!deleteSingleOpTarget || !user) return;
    setIsDeletingSingleOp(true);

    try {
      const { op, index, assetType } = deleteSingleOpTarget;
      
      const allOpsForTicker = clientOperations
        .filter(o => o.ticker === op.ticker)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const success = await deleteSingleOperation({
        clientId: user.id,
        ticker: op.ticker,
        assetType: op.assetType || assetType,
        allOpsForTicker,
        indexToDelete: index,
        exchangeRate
      });

      if (success) {
        if (allOpsForTicker.length <= 1) {
          setExpandedTicker(null);
        }
        setTimeout(async () => {
          await refreshPortfolio();
          setIsDeletingSingleOp(false);
          setDeleteSingleOpTarget(null);
          toast.success('Operación eliminada exitosamente');
        }, 2500);
      } else {
        toast.error('No se pudo eliminar la operación. Inténtalo de nuevo.');
        setIsDeletingSingleOp(false);
        setDeleteSingleOpTarget(null);
      }
    } catch (error) {
      console.error('Error deleting single operation:', error);
      toast.error('Ocurrió un error al eliminar la operación');
      setIsDeletingSingleOp(false);
      setDeleteSingleOpTarget(null);
    }
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-8 space-y-6 md:space-y-8 animate-fade-in">

        {/* ── 1. Top Executive Command Header ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-blue-950/40 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-blue-400 border border-primary/30">
                  <Sparkles className="w-3 h-3 text-blue-400" /> NEXUS PRIVATE WEALTH
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Terminal En Línea
                </span>
                <span className="text-[11px] text-white/40 font-mono">
                  ID: {user?.id ? user.id.slice(0, 10).toUpperCase() : 'NEXUS-01'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Centro de Comando Patrimonial</span>
              </h1>
              <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl">
                Portafolio exclusivo de <span className="text-white font-medium">{user?.name || 'Inversionista'}</span> • Gestión multi-activo con valuación de mercado en tiempo real y asesoría inteligente.
              </p>
            </div>

            {/* Quick Command Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setEditAsset(undefined); setIsTxModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 border border-blue-400/30 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Nueva Operación
              </button>
              
              <button
                onClick={() => setActiveTab('strategy')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 transition-all duration-200"
              >
                <Brain className="w-4 h-4 text-purple-400" />
                Asesor Nexus IA
              </button>

              <button
                onClick={() => setActiveTab('vault')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 transition-all duration-200"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                Bóveda & Reportes
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. Strip de 4 Pilares Financieros (KPI Cards) ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Tarjeta 1: Patrimonio Neto */}
          <div className="glass-card relative p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-blue-500/30 transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/50">Patrimonio Neto</span>
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white tabular-nums">
                {formatValue(netWorth)}
              </h2>
              <p className="text-xs text-white/50 mt-1 tabular-nums">
                ≈ {formatValue(oppositeNetWorth, oppositeCurrency)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
              <span>Costo base invertido</span>
              <span className="font-semibold text-white/70 tabular-nums">{formatValue(globalCostBasisView)}</span>
            </div>
          </div>

          {/* Tarjeta 2: Retorno Total P&L */}
          <div className="glass-card relative p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/50">Rendimiento Histórico</span>
                <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${isGlobalPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {isGlobalPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className={`text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${isGlobalPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isGlobalPositive ? '+' : ''}{formatValue(globalPL)}
                </h2>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${isGlobalPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}">
                {isGlobalPositive ? '+' : ''}{globalPLPercent.toFixed(2)}% de retorno total
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
              <span>Ganancia no realizada</span>
              <span className={`font-semibold tabular-nums ${isGlobalPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isGlobalPositive ? 'Favorable' : 'Bajo observación'}
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Dividendos Anuales */}
          <div className="glass-card relative p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/50">Dividendos Proyectados</span>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white tabular-nums">
                {formatValue(dividendsView)}
                <span className="text-xs text-white/50 font-normal ml-1">/año</span>
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <span>~{dividendYieldPercent.toFixed(2)}% Yield Anual</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
              <span>Flujo pasivo recurrente</span>
              <span className="font-semibold text-amber-400/90 tabular-nums">
                {formatValue(dividendsView / 12)}/mes
              </span>
            </div>
          </div>

          {/* Tarjeta 4: Diversificación & Estado */}
          <div className="glass-card relative p-5 bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/50">Diversificación de Activos</span>
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white tabular-nums">
                {clientPortfolio.length}
                <span className="text-xs text-white/50 font-normal ml-1.5">Activos en Cartera</span>
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <span>{Object.entries(categoryCounts).filter(([cat, count]) => cat !== 'All' && count > 0).length} Clases Distribuidas</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
              <span>Cumplimiento Asignación</span>
              <span className="font-semibold text-emerald-400">Excelente</span>
            </div>
          </div>
        </section>

        {/* ── 3. Barra de Navegación Segmentada (Executive Tabs) ── */}
        <section className="border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                      : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-white text-blue-900' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 4. Contenido Modular Dinámico según Pestaña ── */}

        {/* ── TAB 1: POSICIONES & PORTAFOLIO CORE ── */}
        {activeTab === 'positions' && (
          <div className="space-y-6">
            {/* Header de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
              {/* Category Pills with Counters */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                {CATEGORIES.map(category => {
                  const isActive = selectedCategory === category;
                  const labelMapping: Record<string, string> = {
                    'All': 'Todos',
                    'Renta Variable': 'Renta Variable',
                    'Criptomonedas': 'Criptomonedas',
                    'Renta Fija': 'Renta Fija',
                    'Divisas': 'Divisas'
                  };
                  const count = categoryCounts[category] ?? 0;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        refreshPortfolio();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                          : 'bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent'
                      }`}
                    >
                      <span>{labelMapping[category]}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-blue-500/30 text-blue-200' : 'bg-white/5 text-white/40'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Search & Add button */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar activo o ticker..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { setEditAsset(undefined); setIsTxModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Operar</span>
                </button>
              </div>
            </div>

            {/* Tabla Principal de Posiciones */}
            <div className="glass-card p-0 overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <List className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Posiciones Bajo Custodia
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Precios comparativos de compra promedio vs. mercado en tiempo real
                    </p>
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  Mostrando <span className="font-semibold text-white">{displayedPortfolio.length}</span> activos
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider bg-white/[0.02]">
                      <th className="px-6 py-3.5 font-bold">Activo</th>
                      <th className="px-4 py-3.5 font-bold text-right">Cantidad</th>
                      <th className="px-4 py-3.5 font-bold text-right">Precio Prom.</th>
                      <th className="px-4 py-3.5 font-bold text-right">Precio Mercado</th>
                      <th className="px-4 py-3.5 font-bold text-right">Target</th>
                      <th className="px-4 py-3.5 font-bold text-right">Take Profit</th>
                      <th className="px-4 py-3.5 font-bold text-right">Stop Loss</th>
                      <th className="px-4 py-3.5 font-bold text-right">V. Mercado</th>
                      <th className="px-4 py-3.5 font-bold text-right">Ganancia</th>
                      <th className="px-4 py-3.5 font-bold text-right">Rend.</th>
                      <th className="px-6 py-3.5 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayedPortfolio.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-white/40 text-xs">
                          No se encontraron activos que coincidan con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      displayedPortfolio.map(asset => {
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

                        const priceMain = currency === 'USD' ? currentPriceUSD : currentPriceMXN;
                        const priceSub = currency === 'USD' ? currentPriceMXN : currentPriceUSD;

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
                                <div className="flex items-center gap-3.5">
                                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
                                    {getAssetIcon(asset.type)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <AssetLogo ticker={asset.ticker} logoUrl={asset.logoUrl} type={asset.type} />
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm tracking-tight text-white">{cleanTickerName(asset.ticker)}</p>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 font-semibold uppercase tracking-wider">
                                          {asset.type}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{asset.nativeCurrency}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right font-bold tabular-nums text-sm text-white">{asset.sharesOwned}</td>
                              
                              {/* Avg Price */}
                              <td className="px-4 py-3 text-right tabular-nums text-white/70 text-sm">
                                <div className="flex flex-col gap-0.5 items-end">
                                  <span className="font-semibold text-white/90">{formatValue(avgMain)}</span>
                                  {avgSub > 0 && <span className="text-[10px] text-white/40 font-medium">{formatValue(avgSub, oppositeCurrency)}</span>}
                                </div>
                              </td>

                              {/* Market Price (Precio de Mercado) */}
                              <td className="px-4 py-3 text-right tabular-nums text-sm">
                                {priceMain > 0 ? (
                                  <div className="flex flex-col gap-0.5 items-end">
                                    <span className="font-bold text-white">{formatValue(priceMain)}</span>
                                    {priceSub > 0 && <span className="text-[10px] text-white/40 font-medium">{formatValue(priceSub, oppositeCurrency)}</span>}
                                  </div>
                                ) : (
                                  <span className="text-white/40">-</span>
                                )}
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
                              <td className="px-4 py-3 text-right font-bold tabular-nums text-sm text-white">
                                <div className="flex flex-col gap-0.5 items-end">
                                  <span>{formatValue(valueMain)}</span>
                                  <span className="text-[10px] text-white/40 font-medium">{formatValue(valueSub, oppositeCurrency)}</span>
                                </div>
                              </td>

                              {/* Profit/Loss */}
                              <td className="px-4 py-3 text-right font-bold tabular-nums text-sm">
                                <div className="flex flex-col gap-0.5 items-end">
                                  <span className={isPositiveMain ? 'text-emerald-400' : 'text-rose-400'}>{isPositiveMain ? '+' : ''}{formatValue(plMain)}</span>
                                  <span className={`text-[10px] font-medium ${isPositiveSub ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>{isPositiveSub ? '+' : ''}{formatValue(plSub, oppositeCurrency)}</span>
                                </div>
                              </td>

                              {/* Return */}
                              <td className="px-4 py-3 text-right">
                                <div className="flex flex-col gap-1 items-end">
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs ${isPositiveMain ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
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
                              <tr className="bg-black/30 border-b border-white/5">
                                <td colSpan={11} className="p-0">
                                  <div className="p-6">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                      <History className="w-4 h-4 text-blue-400" /> Historial de Operaciones Registradas
                                    </h4>
                                    {clientOperations.filter(op => op.ticker === asset.ticker).length === 0 ? (
                                      <p className="text-xs text-white/50">No hay operaciones registradas individualmente para este activo.</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {clientOperations
                                          .filter(op => op.ticker === asset.ticker)
                                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                          .map((op, idx) => {
                                            const isBuy = op.type === 'Buy' || op.type === 'Compra';
                                            const isSell = op.type === 'Sell' || op.type === 'Venta';
                                            return (
                                              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                                <div className="flex items-center gap-3">
                                                  <div className={`p-2 rounded-xl ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : isSell ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {isBuy ? <TrendingUp className="w-4 h-4" /> : isSell ? <TrendingDown className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                                                  </div>
                                                  <div>
                                                    <p className="font-bold text-sm text-white">{op.type}</p>
                                                    <p className="text-[10px] text-white/50">{new Date(op.date).toLocaleDateString()}</p>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-right">
                                                  <div>
                                                    <p className="font-bold text-sm text-white">
                                                      {isBuy ? '+' : isSell ? '-' : ''}{op.shares} Unidades
                                                    </p>
                                                    <p className="text-[10px] text-white/50">
                                                      Precio: {formatValue(op.price, op.currency as 'USD' | 'MXN')}
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                    <button 
                                                      onClick={() => setEditSingleOpTarget({ op, index: idx })}
                                                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-transparent hover:border-white/10"
                                                      title="Editar Operación"
                                                    >
                                                      <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                      onClick={() => setDeleteSingleOpTarget({ op, index: idx, assetType: asset.type })}
                                                      className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
                                                      title="Eliminar Operación"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
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
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 2-Column Split: Distribución Gráfica y Objetivos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-1">
                <AllocationDonut />
              </div>
              <div className="lg:col-span-2">
                <GoalTracker />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: INTELIGENCIA FINANCIERA & RENDIMIENTO ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Gráfico principal de evolución */}
            <div className="w-full">
              <PerformanceArea />
            </div>

            {/* Suite completa de Diagnóstico y Salud de Cartera */}
            <div className="w-full">
              <PortfolioHealthDashboard />
            </div>
          </div>
        )}

        {/* ── TAB 3: ESTRATEGIA & NEXUS IA ── */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {/* Banner de Bienvenida Asesor IA */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-blue-950/30 border border-purple-500/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Nexus Wealth Intelligence Suite
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Motor Cognitivo Activo
                    </span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Análisis cuantitativo de carteras, cumplimiento de mandatos y recomendaciones fiduciarias.
                  </p>
                </div>
              </div>
            </div>

            {/* Executive Summary & Goal Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExecutiveSummary />
              </div>
              <div className="lg:col-span-1">
                <GoalTracker />
              </div>
            </div>

            {/* Educational & Strategic Resources */}
            <div className="w-full">
              <AcademyCarousel />
            </div>
          </div>
        )}

        {/* ── TAB 4: ACTIVIDAD & AUDITORÍA ── */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="w-full">
              <RecentActivityFeed />
            </div>
          </div>
        )}

        {/* ── TAB 5: BÓVEDA DOCUMENTAL & FISCALIDAD ── */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <DocumentVault />
          </div>
        )}

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

      {/* ── Delete Single Operation Confirmation Modal ── */}
      {deleteSingleOpTarget && (
        <DeleteSingleOpConfirmModal
          op={deleteSingleOpTarget.op}
          onConfirm={handleConfirmDeleteSingleOp}
          onCancel={() => !isDeletingSingleOp && setDeleteSingleOpTarget(null)}
          isDeleting={isDeletingSingleOp}
          formatValue={formatValue}
        />
      )}

      {/* ── Advisor Note Alert Modal ── */}
      {showNoteAlert && (
        <div className="modal-overlay animate-fade-in z-50">
          <div className="glass-card w-full max-w-sm p-6 relative bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 shadow-[0_0_40px_rgba(26,92,255,0.2)]">
            <button 
              onClick={handleDismissNoteAlert}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-2 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-2">
                <MessageSquareQuote className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Nueva Nota de tu Asesor
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Tienes un nuevo mensaje sobre la estrategia de tu portafolio en la sección <span className="text-white font-bold">Resumen Ejecutivo</span>.
              </p>
              <button 
                onClick={() => {
                  handleDismissNoteAlert();
                  // Optional: scroll to bottom where ExecutiveSummary is usually placed
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="w-full mt-4 py-3 bg-primary text-black font-bold rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(26,92,255,0.4)]"
              >
                Ir a leerlo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
