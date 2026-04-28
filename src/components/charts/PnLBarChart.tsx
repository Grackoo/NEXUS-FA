import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.pnl >= 0;
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-4">
        <div className={`w-2 h-8 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-500'}`} style={{ boxShadow: `0 0 10px ${isPositive ? '#34d399' : '#f43f5e'}` }} />
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-1">{data.name}</p>
          <p className={`font-bold text-lg tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
            {isPositive ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.pnl)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const PnLBarChart: React.FC = () => {
  const { clientPortfolio } = usePortfolio();
  const { currency, exchangeRate } = useCurrency();

  const data = useMemo(() => {
    const pnlList = clientPortfolio.map(asset => {
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
      
      const pnl = valueMain - costBasisMain;
      
      // Clean ticker
      const cleanName = asset.ticker.replace(/(STOCKS|ETFS|CRYPTO|FIBRAS|COMMODITIES|FOREX|EQUITY|INC)$/i, '').trim();

      return { name: cleanName, pnl };
    });

    pnlList.sort((a, b) => b.pnl - a.pnl);
    
    // Top 3 and Bottom 3 (if more than 6, slice them; otherwise keep as is, sorted)
    if (pnlList.length <= 6) {
      return pnlList.sort((a, b) => a.pnl - b.pnl); // sort ascending for BarChart vertical layout
    }

    const top3 = pnlList.slice(0, 3);
    const bottom3 = pnlList.slice(-3);
    return [...top3, ...bottom3].sort((a, b) => a.pnl - b.pnl);

  }, [clientPortfolio, currency, exchangeRate]);

  return (
    <div className="w-full h-[350px] glass-card p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="mb-6">
        <h3 className="text-white/80 font-semibold text-sm uppercase tracking-widest">Top & Bottom Performers</h3>
        <p className="text-white/40 text-[11px] mt-1">Ganancia y pérdida absoluta (USD)</p>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(val) => `$${val >= 0 ? '+' : ''}${val/1000}k`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 'bold' }}
              width={50}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'} 
                  style={{ filter: `drop-shadow(0px 0px 8px ${entry.pnl >= 0 ? 'rgba(16,185,129,0.6)' : 'rgba(244,63,94,0.6)'})` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
