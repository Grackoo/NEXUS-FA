import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AdvancedRealTimeChart, Screener } from 'react-ts-tradingview-widgets';
import { Plus, Search, Star, ArrowDownToLine, ArrowUpToLine, BellRing, X, Trash2, Activity } from 'lucide-react';
import MarketHeatmap from '../components/MarketHeatmap';
import EconomicEvents from '../components/EconomicEvents';
import SmartTransactionModal from '../components/SmartTransactionModal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface WatchlistItem {
  symbol: string;
  name: string;
  type: string;
  ticker: string;
  mockPrice: number;
  isCustom?: boolean;
}

const DEFAULT_WATCHLIST_ITEMS: WatchlistItem[] = [
  { symbol: 'BINANCE:BTCUSD', name: 'Bitcoin', type: 'Cripto', ticker: 'BTC', mockPrice: 65000 },
  { symbol: 'BINANCE:ETHUSD', name: 'Ethereum', type: 'Cripto', ticker: 'ETH', mockPrice: 3500 },
  { symbol: 'TVC:USOIL', name: 'Brent Oil', type: 'Commodity', ticker: 'BNO', mockPrice: 85.5 },
  { symbol: 'TVC:GOLD', name: 'Physical Gold', type: 'Commodity', ticker: 'GLD', mockPrice: 2350 },
  { symbol: 'FX:EURUSD', name: 'EUR/USD', type: 'Forex', ticker: 'EUR/USD', mockPrice: 1.08 },
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', type: 'Stock', ticker: 'AAPL', mockPrice: 175.5 },
  { symbol: 'NASDAQ:NVDA', name: 'Nvidia Corp.', type: 'Stock', ticker: 'NVDA', mockPrice: 850.2 },
];

const CATEGORIES = ['Todos', 'Cripto', 'Stock', 'Commodity', 'Forex'];

const Watchlist: React.FC = () => {
  const { user } = useAuth();

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('nexus_watchlist_custom_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_WATCHLIST_ITEMS, ...parsed];
      } catch (e) {
        console.error('Error cargando watchlist custom', e);
      }
    }
    return DEFAULT_WATCHLIST_ITEMS;
  });

  const [selectedAsset, setSelectedAsset] = useState<WatchlistItem>(watchlistItems[0] || DEFAULT_WATCHLIST_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Modal de Añadir Activo a la lista
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  // Modal para Operar Activo
  const [isOperarModalOpen, setIsOperarModalOpen] = useState(false);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;

    const formattedTicker = newTicker.trim().toUpperCase();

    // Determinar símbolo para TradingView
    let symbol = formattedTicker;
    if (!symbol.includes(':')) {
      if (['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE'].includes(formattedTicker)) {
        symbol = `BINANCE:${formattedTicker}USDT`;
      } else if (['EURUSD', 'USDMXN', 'GBPUSD'].includes(formattedTicker)) {
        symbol = `FX:${formattedTicker}`;
      } else if (['GOLD', 'XAUUSD', 'GLD'].includes(formattedTicker)) {
        symbol = `TVC:GOLD`;
      } else {
        symbol = formattedTicker;
      }
    }

    const newWatchlistItem: WatchlistItem = {
      symbol,
      name: formattedTicker,
      ticker: formattedTicker,
      type: 'Activo',
      mockPrice: Math.floor(Math.random() * 800) + 120,
      isCustom: true,
    };

    const updatedList = [newWatchlistItem, ...watchlistItems];
    setWatchlistItems(updatedList);
    setSelectedAsset(newWatchlistItem);

    // Persistir solo los customs
    const customs = updatedList.filter(item => item.isCustom);
    localStorage.setItem('nexus_watchlist_custom_items', JSON.stringify(customs));

    setIsModalOpen(false);
    setNewTicker('');
    toast.success(`${formattedTicker} agregado a tu lista`);
  };

  const handleRemoveCustomAsset = (symbolToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = watchlistItems.filter(item => item.symbol !== symbolToRemove);
    setWatchlistItems(updated);

    const customs = updated.filter(item => item.isCustom);
    localStorage.setItem('nexus_watchlist_custom_items', JSON.stringify(customs));

    if (selectedAsset.symbol === symbolToRemove) {
      setSelectedAsset(updated[0] || DEFAULT_WATCHLIST_ITEMS[0]);
    }
    toast.success('Activo removido de tu lista');
  };
  
  const [targets, setTargets] = useState<Record<string, { buy?: number, sell?: number }>>(() => {
    const saved = localStorage.getItem('nexus_watchlist_targets');
    return saved ? JSON.parse(saved) : {};
  });

  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');

  // Sincronizar inputs al cambiar de activo
  useEffect(() => {
    setBuyInput(targets[selectedAsset.ticker]?.buy?.toString() || '');
    setSellInput(targets[selectedAsset.ticker]?.sell?.toString() || '');
  }, [selectedAsset, targets]);

  const handleSaveTargets = () => {
    const newTargets = { ...targets };
    if (!newTargets[selectedAsset.ticker]) newTargets[selectedAsset.ticker] = {};
    
    if (buyInput) newTargets[selectedAsset.ticker].buy = parseFloat(buyInput);
    else delete newTargets[selectedAsset.ticker].buy;
    
    if (sellInput) newTargets[selectedAsset.ticker].sell = parseFloat(sellInput);
    else delete newTargets[selectedAsset.ticker].sell;
    
    setTargets(newTargets);
    localStorage.setItem('nexus_watchlist_targets', JSON.stringify(newTargets));
    toast.success(`Niveles clave guardados para ${selectedAsset.ticker}`);
  };

  const filteredItems = watchlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-16 bg-[#040711] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-8 space-y-8 animate-fade-in">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary tracking-wider uppercase mb-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Terminal de Mercados en Tiempo Real
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Watchlist & Mercados
            </h1>
            <p className="text-white/50 text-xs md:text-sm max-w-xl">
              Monitorea cotizaciones institucionales, define rangos de acumulación y lanza órdenes con sincronización de Nexus AI.
            </p>
          </div>
        </header>

        {/* Top Section: Watchlist Sidebar + Main Chart */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Sidebar Watchlist */}
          <div className="w-full lg:w-[32%] glass-card p-0 flex flex-col bg-gradient-to-b from-[#0c1322]/90 to-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden h-[680px] shadow-2xl relative">
            <div className="p-4 md:p-5 border-b border-white/5 space-y-3.5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-primary" fill="currentColor" /> Mis Listas
                </h2>
                <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {filteredItems.length} activos
                </span>
              </div>

              {/* Buscador */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar ticker (ej. AAPL, BTC)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Categorías Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-primary text-white shadow-[0_0_10px_rgba(26,92,255,0.4)]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lista de Activos */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2.5 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No se encontraron activos para &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredItems.map((item) => {
                  const itemTargets = targets[item.ticker] || {};
                  const isBuyZone = itemTargets.buy && item.mockPrice <= itemTargets.buy;
                  const isSellZone = itemTargets.sell && item.mockPrice >= itemTargets.sell;
                  const isSelected = selectedAsset.symbol === item.symbol;
                  
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => setSelectedAsset(item)}
                      className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer group ${
                        isSelected 
                          ? 'bg-gradient-to-r from-primary/25 via-primary/10 to-transparent border-l-2 border-primary shadow-lg' 
                          : 'hover:bg-white/[0.04] border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,92,255,0.5)]' 
                            : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          {item.ticker.slice(0, 2)}
                        </div>

                        <div className="min-w-0">
                          <p className={`text-xs font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-white/40 tracking-wider font-semibold uppercase">{item.ticker}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-gray-400 font-medium">{item.type}</span>
                            {isBuyZone && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">COMPRA</span>}
                            {isSellZone && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1 rounded font-bold">VENTA</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-white/90 tabular-nums">${item.mockPrice}</span>
                        {item.isCustom && (
                          <button
                            onClick={(e) => handleRemoveCustomAsset(item.symbol, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-all"
                            title="Eliminar activo de la lista"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Botón Añadir Activo */}
            <div className="p-3.5 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-primary hover:border-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(26,92,255,0.15)]"
              >
                <Plus className="w-4 h-4" /> Añadir Activo a Lista
              </button>
            </div>

            {/* Modal Añadir Activo (Overlay dentro del Sidebar) */}
            {isModalOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 rounded-3xl">
                <div className="bg-[#0b101c] border border-primary/30 rounded-2xl w-full p-5 relative shadow-2xl animate-fade-in">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> Añadir Nuevo Ticker
                  </h3>
                  
                  <form onSubmit={handleAddAsset} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1.5">
                        Ticker o Símbolo del Activo
                      </label>
                      <input 
                        type="text" 
                        required
                        value={newTicker}
                        onChange={(e) => setNewTicker(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-primary shadow-inner"
                        placeholder="ej. TSLA, SOLUSD, CETES, SPY"
                        autoFocus
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                        Solo ingresa el ticker y el sistema lo configurará automáticamente para visualizarlo en el gráfico.
                      </p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(26,92,255,0.4)]"
                    >
                      Añadir a la lista
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Main Chart Area */}
          <div className="w-full lg:w-[68%] glass-card p-4 md:p-6 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-3xl h-auto shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            
            {/* Chart Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{selectedAsset.name}</h2>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-primary-glow">
                    {selectedAsset.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50 font-medium">
                  <span>Ticker: <strong className="text-white">{selectedAsset.ticker}</strong></span>
                  <span>•</span>
                  <span>Símbolo TV: <strong className="text-gray-300 font-mono text-[11px]">{selectedAsset.symbol}</strong></span>
                </div>
              </div>

              {/* Botones de Alertas de Precio y Operar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Target Inputs */}
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-1.5">
                  <div className="flex items-center gap-1.5 border-r border-white/10 pr-2 pl-1">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                    <input 
                      type="number" 
                      value={buyInput}
                      onChange={(e) => setBuyInput(e.target.value)}
                      placeholder="Zona Compra" 
                      className="bg-transparent text-xs text-white w-20 focus:outline-none placeholder-gray-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pl-1 pr-2">
                    <ArrowUpToLine className="w-3.5 h-3.5 text-rose-400" />
                    <input 
                      type="number" 
                      value={sellInput}
                      onChange={(e) => setSellInput(e.target.value)}
                      placeholder="Zona Venta" 
                      className="bg-transparent text-xs text-white w-20 focus:outline-none placeholder-gray-500"
                    />
                  </div>
                  <button 
                    onClick={handleSaveTargets}
                    title="Guardar alertas de precio"
                    className="bg-primary/20 hover:bg-primary text-white p-1.5 rounded-xl transition-colors border border-primary/40"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Botón Operar Activo */}
                <button 
                  onClick={() => setIsOperarModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold hover:scale-[1.03] transition-all shadow-[0_0_20px_rgba(26,92,255,0.4)] flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Operar Activo
                </button>
              </div>
            </div>
            
            {/* Widget TradingView */}
            <div className="w-full h-[520px] lg:h-[580px] rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner">
              <AdvancedRealTimeChart 
                key={selectedAsset.symbol}
                theme="dark" 
                symbol={selectedAsset.symbol}
                width="100%"
                height="100%"
                locale="es"
                interval="D"
                timezone="Etc/UTC"
                style="1"
                hide_side_toolbar={false}
                allow_symbol_change={true}
                save_image={false}
                studies={[
                  "MASimple@tv-basicstudies",
                  "RSI@tv-basicstudies"
                ]}
              />
            </div>
          </div>
        </div>

        {/* Heatmap and Economic Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pt-6">
          <div className="lg:col-span-7">
            <MarketHeatmap />
          </div>
          <div className="lg:col-span-5">
            <EconomicEvents />
          </div>
        </div>

        {/* Trending Screener Section */}
        <div className="space-y-4 pt-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Screener de Tendencias Globales</h2>
            <p className="text-xs text-white/50">Descubre en tiempo real los activos con mayor volumen y capitalización del mercado.</p>
          </div>
          
          <div className="glass-card p-4 md:p-6 bg-gradient-to-tr from-slate-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-y-auto shadow-2xl h-[480px] scrollbar-hide">
             <div className="w-full h-full">
               <Screener 
                  colorTheme="dark" 
                  width="100%" 
                  height="100%" 
                  locale="es"
                  isTransparent={true}
                  market="america"
                  defaultColumn="overview"
                  defaultScreen="most_capitalized"
                  showToolbar={true}
               />
             </div>
          </div>
        </div>
      </main>

      {/* Modal para Operar Activo (Integrado con SmartTransactionModal) */}
      {isOperarModalOpen && user && (
        <SmartTransactionModal
          isOpen={isOperarModalOpen}
          onClose={() => setIsOperarModalOpen(false)}
          clientId={user.id}
          clientName={user.name}
          defaultAssetType={
            selectedAsset.type === 'Cripto' ? 'Crypto' :
            selectedAsset.type === 'Forex' ? 'Forex' :
            selectedAsset.type === 'Commodity' ? 'Commodities' : 'Stocks'
          }
          initialTicker={selectedAsset.ticker}
        />
      )}
    </div>
  );
};

export default Watchlist;
