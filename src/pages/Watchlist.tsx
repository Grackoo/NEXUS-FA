import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { SymbolOverview, StockMarket } from 'react-ts-tradingview-widgets';
import { Plus, Search, Star, Target, ArrowDownToLine, ArrowUpToLine, BellRing } from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  name: string;
  type: string;
  ticker: string;
  mockPrice: number;
}

const WATCHLIST_ITEMS: WatchlistItem[] = [
  { symbol: 'BINANCE:BTCUSD', name: 'Bitcoin', type: 'Cripto', ticker: 'BTC', mockPrice: 65000 },
  { symbol: 'BINANCE:ETHUSD', name: 'Ethereum', type: 'Cripto', ticker: 'ETH', mockPrice: 3500 },
  { symbol: 'TVC:USOIL', name: 'Brent Oil', type: 'Commodity', ticker: 'BNO', mockPrice: 85.5 },
  { symbol: 'TVC:GOLD', name: 'Physical Gold', type: 'Commodity', ticker: 'GLD', mockPrice: 2350 },
  { symbol: 'FX:EURUSD', name: 'EUR/USD', type: 'Forex', ticker: 'EUR/USD', mockPrice: 1.08 },
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', type: 'Stock', ticker: 'AAPL', mockPrice: 175.5 },
  { symbol: 'NASDAQ:NVDA', name: 'Nvidia Corp.', type: 'Stock', ticker: 'NVDA', mockPrice: 850.2 },
];

const Watchlist: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<WatchlistItem>(WATCHLIST_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [targets, setTargets] = useState<Record<string, { buy?: number, sell?: number }>>(() => {
    const saved = localStorage.getItem('nexus_watchlist_targets');
    return saved ? JSON.parse(saved) : {};
  });

  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');

  // Sincronizar inputs al cambiar de activo
  React.useEffect(() => {
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
  };

  const filteredItems = WATCHLIST_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12 bg-[#050505]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-8 mt-6 md:mt-10 space-y-10 animate-fade-in">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              <Star className="w-8 h-8 text-primary" fill="currentColor" /> Watchlist & Mercados
            </h1>
            <p className="text-white/50 text-xs md:text-sm max-w-lg">
              Monitorea los precios en tiempo real y descubre las últimas tendencias del mercado global.
            </p>
          </div>
        </header>

        {/* Top Section: Watchlist + Main Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Sidebar Watchlist */}
          <div className="md:col-span-5 lg:col-span-3 glass-card p-0 flex flex-col bg-gradient-to-b from-slate-900/80 to-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden h-[550px] shadow-2xl">
            <div className="p-5 md:p-6 border-b border-white/5 space-y-4 bg-white/[0.02]">
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Mis Listas
              </h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar símbolo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors shadow-inner"
                />
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
              <div className="text-[9px] uppercase tracking-widest font-bold text-white/30 px-3 py-2 mb-2">
                Activos Monitoreados
              </div>
              <div className="space-y-1.5">
                {filteredItems.map((item) => {
                  const itemTargets = targets[item.ticker] || {};
                  const isBuyZone = itemTargets.buy && item.mockPrice <= itemTargets.buy;
                  const isSellZone = itemTargets.sell && item.mockPrice >= itemTargets.sell;
                  
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => setSelectedAsset(item)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 group ${
                        selectedAsset.symbol === item.symbol 
                          ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary shadow-lg' 
                          : 'hover:bg-white/[0.04] border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors relative ${
                          selectedAsset.symbol === item.symbol 
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(26,92,255,0.4)]' 
                            : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          {item.ticker[0]}
                          {(isBuyZone || isSellZone) && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBuyZone ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-3 w-3 ${isBuyZone ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold tracking-tight transition-colors ${
                            selectedAsset.symbol === item.symbol ? 'text-white' : 'text-white/70 group-hover:text-white'
                          }`}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-white/40 tracking-widest uppercase">
                              {item.ticker}
                            </p>
                            {isBuyZone && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">ZONA COMPRA</span>}
                            {isSellZone && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">ZONA VENTA</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white/90">${item.mockPrice}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-5 border-t border-white/5 bg-white/[0.01]">
              <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Añadir Activo
              </button>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="md:col-span-7 lg:col-span-9 glass-card p-6 md:p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl h-[550px] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Background glow for chart */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">{selectedAsset.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/70">{selectedAsset.type}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Ticker: {selectedAsset.ticker}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                    <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                    <input 
                      type="number" 
                      value={buyInput}
                      onChange={(e) => setBuyInput(e.target.value)}
                      placeholder="Precio Compra" 
                      className="bg-transparent text-xs text-white w-24 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-1 pr-2">
                    <ArrowUpToLine className="w-4 h-4 text-rose-400" />
                    <input 
                      type="number" 
                      value={sellInput}
                      onChange={(e) => setSellInput(e.target.value)}
                      placeholder="Precio Venta" 
                      className="bg-transparent text-xs text-white w-24 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSaveTargets}
                    className="bg-primary/20 hover:bg-primary text-white p-1.5 rounded-lg transition-colors border border-primary/50"
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                </div>
                
                <button className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Operar Activo
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40">
              <SymbolOverview 
                colorTheme="dark" 
                chartType="area" 
                downColor="#ef4444" 
                upColor="#10b981" 
                dateFormat="dd MMM 'yy"
                symbols={[[selectedAsset.name, selectedAsset.symbol]]}
                width="100%"
                height="100%"
                locale="es"
              />
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="space-y-6 pt-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Tendencias Globales</h2>
            <p className="text-xs md:text-sm text-white/50 max-w-2xl">Monitor en tiempo real de los principales movimientos del mercado: descubre los activos con mayor crecimiento y volumen.</p>
          </div>
          
          <div className="glass-card p-4 md:p-8 bg-gradient-to-tr from-slate-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
             <StockMarket 
                colorTheme="dark" 
                width="100%" 
                height={550} 
                locale="es"
                isTransparent={true}
                showChart={true}
             />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watchlist;
