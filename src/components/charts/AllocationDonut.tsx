import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const COLORS = ['#06B6D4', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-1">{data.name}</p>
        <p className="text-white font-bold text-lg tabular-nums">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export const AllocationDonut: React.FC = () => {
  const { clientPortfolio } = usePortfolio();
  const { currency, exchangeRate, convertToView, formatValue } = useCurrency();

  const { data, total } = useMemo(() => {
    let totalValue = 0;
    const allocation = clientPortfolio.reduce((acc: any[], asset) => {
      const existing = acc.find(item => item.name === asset.type);
      const currentPriceMXN = asset.nativeCurrency === 'USD' ? asset.realTimePrice * exchangeRate : asset.realTimePrice;
      const val = convertToView(asset.sharesOwned * currentPriceMXN, 'MXN');
      
      if (val > 0) {
        if (existing) existing.value += val;
        else acc.push({ name: asset.type, value: val });
        totalValue += val;
      }
      return acc;
    }, []);
    return { data: allocation, total: totalValue };
  }, [clientPortfolio, exchangeRate, currency, convertToView]);

  return (
    <div className="relative w-full h-full min-h-[350px] glass-card p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Glow background effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 font-semibold text-sm uppercase tracking-widest">Asignación de Activos</h3>
      </div>
      
      <div className="w-full h-full pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ filter: `drop-shadow(0px 4px 10px ${COLORS[index % COLORS.length]}80)` }}
                />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <span className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Total</span>
        <span className="text-white font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {formatValue(total)}
        </span>
      </div>
    </div>
  );
};
