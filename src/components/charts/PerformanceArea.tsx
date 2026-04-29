import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mb-3 border-b border-white/10 pb-2">{label} 2026</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
                <span className="text-white/70 text-xs font-medium">{entry.name}</span>
              </div>
              <span className="text-white font-bold text-sm tabular-nums">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceArea: React.FC = () => {
  const { clientPortfolio } = usePortfolio();
  const { currency, exchangeRate } = useCurrency();

  const data = useMemo(() => {
    // Determine the current total net worth and total cost basis in the selected currency
    let totalCurrentValue = 0;
    let totalCostBasis = 0;

    clientPortfolio.forEach(asset => {
      let avgNativeUSD = asset.avgPurchasePriceUSD;
      let avgNativeMXN = asset.avgPurchasePriceMXN;
      if (!avgNativeUSD && avgNativeMXN) avgNativeUSD = avgNativeMXN / exchangeRate;
      if (!avgNativeMXN && avgNativeUSD) avgNativeMXN = avgNativeUSD * exchangeRate;

      let currentPriceUSD = 0;
      let currentPriceMXN = 0;
      if (asset.nativeCurrency === 'USD') {
        currentPriceUSD = asset.realTimePrice;
        currentPriceMXN = asset.realTimePrice * exchangeRate;
      } else {
        currentPriceMXN = asset.realTimePrice;
        currentPriceUSD = asset.realTimePrice / exchangeRate;
      }

      const valueMain = currency === 'USD' ? (asset.sharesOwned * currentPriceUSD) : (asset.sharesOwned * currentPriceMXN);
      const avgMain = currency === 'USD' ? avgNativeUSD : avgNativeMXN;
      const costBasisMain = asset.sharesOwned * avgMain;

      totalCurrentValue += valueMain;
      totalCostBasis += costBasisMain;
    });

    // Create last 6 months buckets (since we don't have historical prices, we simulate the 'current' curve
    // from cost basis to the real current value to show the trend, and group the operations for the 'capital' curve)
    const months = [];
    const now = new Date();
    
    // Total PnL to distribute
    const totalPnl = totalCurrentValue - totalCostBasis;
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
      
      // We will approximate the curve. In a real app we'd fetch historical prices per day.
      // Here we assume the capital was built up over time and PnL accumulated linearly towards today.
      const factor = (5 - i) / 5; // 0 to 1
      
      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        capital: totalCostBasis * (0.8 + (0.2 * factor)), // Simulate gradual capital injection
        current: (totalCostBasis * (0.8 + (0.2 * factor))) + (totalPnl * factor)
      });
    }

    return months;
  }, [clientPortfolio, currency, exchangeRate]);

  return (
    <div className="w-full h-[400px] glass-card p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white/80 font-semibold text-sm uppercase tracking-widest">Rendimiento Histórico</h3>
          <p className="text-white/40 text-[11px] mt-1">Capital Invertido vs Valor de Mercado</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"/> Valor Actual</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]"/> Capital Invertido</div>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="capital" 
              name="Capital Invertido"
              stroke="#a855f7" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCapital)" 
            />
            <Area 
              type="monotone" 
              dataKey="current" 
              name="Valor Actual"
              stroke="#22d3ee" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCurrent)" 
              style={{ filter: 'drop-shadow(0px 0px 8px rgba(34,211,238,0.5))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
