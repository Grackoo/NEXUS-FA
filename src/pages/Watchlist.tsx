import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { SymbolOverview, StockMarket } from 'react-ts-tradingview-widgets';
import { Plus, Search, Star } from 'lucide-react';

const WATCHLIST_ITEMS = [
  { symbol: 'BINANCE:BTCUSD', name: 'Bitcoin', type: 'Cripto', ticker: 'BTC' },
  { symbol: 'BINANCE:ETHUSD', name: 'Ethereum', type: 'Cripto', ticker: 'ETH' },
  { symbol: 'TVC:USOIL', name: 'Brent Oil', type: 'Commodity', ticker: 'BNO' },
  { symbol: 'TVC:GOLD', name: 'Physical Gold', type: 'Commodity', ticker: 'GLD' },
  { symbol: 'FX:EURUSD', name: 'EUR/USD', type: 'Forex', ticker: 'EUR/USD' },
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', type: 'Stock', ticker: 'AAPL' },
  { symbol: 'NASDAQ:NVDA', name: 'Nvidia Corp.', type: 'Stock', ticker: 'NVDA' },
];

const Watchlist: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState(WATCHLIST_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Watchlist */}
          <div className="glass-card p-0 flex flex-col bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden h-[600px]">
            <div className="p-6 border-b border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-white tracking-wide">Mis Listas</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar símbolo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
              <div className="text-[10px] uppercase tracking-widest font-medium text-white/40 px-4 py-2 mb-1">
                Posición
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedAsset(item)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                      selectedAsset.symbol === item.symbol 
                        ? 'bg-white/10 shadow-lg border border-white/10' 
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        selectedAsset.symbol === item.symbol ? 'bg-primary text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {item.ticker[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${selectedAsset.symbol === item.symbol ? 'text-white' : 'text-white/80'}`}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-white/40 tracking-wider uppercase">
                          {item.ticker}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/5">
              <button className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-semibold hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Añadir seguridad
              </button>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-3 glass-card p-6 md:p-8 bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl h-[600px] flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-semibold text-white tracking-tight mb-1">{selectedAsset.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest font-medium text-white/50">{selectedAsset.type}</span>
                  <span className="text-xs uppercase tracking-widest font-medium text-white/50 border-l border-white/10 pl-3">Ticker: {selectedAsset.ticker}</span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Cartera de Inversiones
              </button>
            </div>
            
            <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/5">
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
        <div className="space-y-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Tendencias</h2>
            <p className="text-xs text-white/50">Identifique las últimas tendencias en acciones, ETF y criptomonedas directamente desde los mercados.</p>
          </div>
          
          <div className="glass-card p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
             <StockMarket 
                colorTheme="dark" 
                width="100%" 
                height={500} 
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
