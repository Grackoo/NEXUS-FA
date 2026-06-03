import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';

export const DividendProjectionChart: React.FC = () => {
  const { clientPortfolio } = usePortfolio();
  const { currency, exchangeRate, formatValue } = useCurrency();

  // Diccionario de yields y meses de pago simplificado
  const DIVIDEND_DATA: Record<string, { yield: number, months: number[] }> = {
    'AAPL': { yield: 0.005, months: [2, 5, 8, 11] },
    'OXY': { yield: 0.015, months: [1, 4, 7, 10] },
    'KO': { yield: 0.03, months: [4, 7, 10, 12] },
    'JNJ': { yield: 0.03, months: [3, 6, 9, 12] },
    'T': { yield: 0.065, months: [2, 5, 8, 11] },
    'XOM': { yield: 0.033, months: [3, 6, 9, 12] },
    'IVV': { yield: 0.013, months: [3, 6, 9, 12] },
    'SPY': { yield: 0.013, months: [1, 4, 7, 10] },
    'FIBRAPL14': { yield: 0.06, months: [3, 6, 9, 12] },
    'FUNO11': { yield: 0.08, months: [2, 5, 8, 11] },
    'FMTY14': { yield: 0.075, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, // Mensual
  };

  // Nombres cortos para los meses
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Initialize array for 12 months
  const monthlyData = monthNames.map((name, index) => ({
    name,
    amount: 0,
    monthNum: index + 1
  }));

  // Calculate distributions
  clientPortfolio.forEach(asset => {
    const data = DIVIDEND_DATA[asset.ticker];
    if (data && data.yield > 0) {
      // Valor en la moneda seleccionada para visualización
      let assetValueView = 0;
      if (asset.nativeCurrency === 'USD') {
        assetValueView = currency === 'USD' 
          ? asset.sharesOwned * asset.realTimePrice 
          : (asset.sharesOwned * asset.realTimePrice) * exchangeRate;
      } else {
        assetValueView = currency === 'USD'
          ? (asset.sharesOwned * asset.realTimePrice) / exchangeRate
          : asset.sharesOwned * asset.realTimePrice;
      }

      // Total anual estimado
      const annualDividend = assetValueView * data.yield;
      
      // Repartir en los meses de pago
      const payoutAmount = annualDividend / data.months.length;
      
      data.months.forEach(m => {
        const monthIndex = m - 1;
        monthlyData[monthIndex].amount += payoutAmount;
      });
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 bg-slate-900/90 border border-white/10 rounded-xl shadow-xl">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-emerald-400 font-bold text-sm">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {monthlyData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.amount > 0 ? '#10B981' : 'rgba(255,255,255,0.05)'} 
                opacity={entry.amount > 0 ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DividendProjectionChart;
