import React from 'react';
import { Activity } from 'lucide-react';

interface HeatmapAsset {
  ticker: string;
  changePercent: number;
}

const mockHeatmapData: HeatmapAsset[] = [
  { ticker: 'BTC', changePercent: 2.5 },
  { ticker: 'ETH', changePercent: -1.2 },
  { ticker: 'AAPL', changePercent: 0.8 },
  { ticker: 'NVDA', changePercent: 4.5 },
  { ticker: 'TSLA', changePercent: -3.4 },
  { ticker: 'MSFT', changePercent: 1.1 },
  { ticker: 'AMZN', changePercent: -0.5 },
  { ticker: 'GOOGL', changePercent: 0.2 },
  { ticker: 'META', changePercent: 3.2 },
  { ticker: 'BNO', changePercent: -2.1 },
  { ticker: 'GLD', changePercent: 0.5 },
  { ticker: 'EUR/USD', changePercent: -0.1 },
];

export const MarketHeatmap: React.FC = () => {
  const getColorClass = (change: number) => {
    if (change >= 3) return 'bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (change >= 1) return 'bg-emerald-600/70';
    if (change > 0) return 'bg-emerald-800/60';
    if (change <= -3) return 'bg-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
    if (change <= -1) return 'bg-rose-600/70';
    if (change < 0) return 'bg-rose-800/60';
    return 'bg-gray-700/60';
  };

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl h-full shadow-2xl flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-white tracking-tight">Mapa de Calor Sectorial</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1 relative z-10">
        {mockHeatmapData.map((asset) => (
          <div 
            key={asset.ticker}
            className={`rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 border border-white/5 ${getColorClass(asset.changePercent)}`}
          >
            <span className="text-white font-bold text-sm tracking-widest">{asset.ticker}</span>
            <span className="text-white/90 text-xs font-semibold mt-1">
              {asset.changePercent > 0 ? '+' : ''}{asset.changePercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketHeatmap;
