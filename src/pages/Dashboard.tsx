import React from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, List } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const { clientPortfolio, totalNetWorthUSD, totalNetWorthMXN } = usePortfolio();
  const { currency, formatValue, convertToView } = useCurrency();

  const netWorth = currency === 'USD' ? totalNetWorthUSD : totalNetWorthMXN;

  // Pie chart data grouping
  const allocation = clientPortfolio.reduce((acc: any[], asset) => {
    const existing = acc.find(item => item.name === asset.type);
    const valueInView = convertToView(asset.sharesOwned * asset.realTimePrice, asset.nativeCurrency);
    if (existing) {
      existing.value += valueInView;
    } else {
      acc.push({ name: asset.type, value: valueInView });
    }
    return acc;
  }, []);

  const COLORS = ['#1A5CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 mt-10 space-y-8 animate-fade-in">
        {/* Header Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Card */}
          <div className="md:col-span-2 glass-card flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Patrimonio Neto Total</p>
              <h1 className="text-5xl font-bold tracking-tight mb-4 tabular-nums">
                {formatValue(netWorth)}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.40%
                </div>
                <p className="text-xs text-gray-500">vs. mes pasado: +$1,240.00 USD</p>
              </div>
            </div>
            
            {/* Visual background element */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-primary-blue/5 to-transparent flex items-center justify-end pr-8">
               <TrendingUp className="w-32 h-32 text-primary-blue/10 rotate-12" />
            </div>
          </div>

          {/* Asset Allocation Mini Card */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold flex items-center gap-2">
                 <PieChartIcon className="w-4 h-4 text-primary-blue" />
                 Distribución
               </h3>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Positions Table Section */}
        <section className="glass-card p-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <List className="w-5 h-5 text-primary-blue" />
              Posiciones Actuales
            </h3>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">Exportar</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] uppercase tracking-widest">
                  <th className="px-8 py-4 font-semibold">Activo</th>
                  <th className="px-4 py-4 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-4 font-semibold text-right">Precio Promedio</th>
                  <th className="px-4 py-4 font-semibold text-right">Poder de Mercado</th>
                  <th className="px-4 py-4 font-semibold text-right">Ganancia / Perdida</th>
                  <th className="px-8 py-4 font-semibold text-right">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientPortfolio.map((asset) => {
                  const currentValue = asset.sharesOwned * asset.realTimePrice;
                  const valueInView = convertToView(currentValue, asset.nativeCurrency);
                  const avgPriceInView = convertToView(
                        currency === 'USD' ? asset.avgPurchasePriceUSD : asset.avgPurchasePriceMXN,
                        currency
                  );
                  
                  const pl = valueInView - (asset.sharesOwned * avgPriceInView);
                  const plPercentage = (pl / (asset.sharesOwned * avgPriceInView)) * 100;
                  const isPositive = pl >= 0;

                  return (
                    <tr key={asset.ticker} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-primary-blue border border-white/5">
                            {asset.ticker.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{asset.ticker}</p>
                            <p className="text-[10px] text-gray-500">{asset.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right font-medium tabular-nums">{asset.sharesOwned}</td>
                      <td className="px-4 py-5 text-right tabular-nums">
                        {formatValue(avgPriceInView)}
                      </td>
                      <td className="px-4 py-5 text-right font-bold tabular-nums">
                        {formatValue(valueInView)}
                      </td>
                      <td className={`px-4 py-5 text-right font-semibold tabular-nums ${isPositive ? 'text-emerald' : 'text-crimson'}`}>
                        {isPositive ? '+' : ''}{formatValue(pl)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`inline-flex items-center gap-1 font-bold text-xs ${isPositive ? 'text-emerald' : 'text-crimson'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {plPercentage.toFixed(2)}%
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
    </div>
  );
};

export default Dashboard;
