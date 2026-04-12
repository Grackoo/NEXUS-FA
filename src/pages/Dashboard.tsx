import React from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  List, 
  Coins, 
  Building2, 
  Landmark, 
  Gem, 
  Activity,
  Layers
} from 'lucide-react';
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

  const COLORS = ['#1A5CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Stocks': return <Activity className="w-5 h-5" />;
      case 'ETFs': return <Layers className="w-5 h-5" />;
      case 'Crypto': return <Coins className="w-5 h-5" />;
      case 'FIBRAs': return <Building2 className="w-5 h-5" />;
      case 'Fixed Income': return <Landmark className="w-5 h-5" />;
      case 'Commodities': return <Gem className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 mt-10 space-y-8 animate-fade-in">
        {/* Header Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Card */}
          <div className="md:col-span-2 glass-card flex flex-col justify-between overflow-hidden relative p-8">
            <div className="relative z-10">
              <p className="text-gray-400 font-medium text-xs mb-1 uppercase tracking-widest">Patrimonio Neto Total</p>
              <h1 className="text-5xl font-bold tracking-tight mb-4 tabular-nums text-gradient">
                {formatValue(netWorth)}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-bold border border-emerald/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.40%
                </div>
                <p className="text-xs text-gray-400">vs. mes pasado: +$1,240.00 USD</p>
              </div>
            </div>
            
            {/* Visual background element */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent flex items-center justify-end pr-8">
               <TrendingUp className="w-32 h-32 text-primary/10 rotate-12" />
            </div>
          </div>

          {/* Asset Allocation Mini Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-sm tracking-wider flex items-center gap-2 uppercase text-gray-400">
                 <PieChartIcon className="w-4 h-4 text-primary" />
                 Distribución
               </h3>
            </div>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'rgba(5, 5, 5, 0.8)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Activos</p>
                <p className="text-lg font-bold">{allocation.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Positions Table Section */}
        <section className="glass-card p-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <List className="w-5 h-5 text-primary" />
              </div>
              Posiciones Actuales
            </h3>
            <div className="flex gap-2">
               <button className="glass-button secondary px-4 py-2 text-xs">Exportar Datos</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase tracking-widest bg-white/[0.02]">
                  <th className="px-8 py-5 font-semibold">Activo</th>
                  <th className="px-4 py-5 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-5 font-semibold text-right">Precio Prom.</th>
                  <th className="px-4 py-5 font-semibold text-right">V. Mercado</th>
                  <th className="px-4 py-5 font-semibold text-right">Ganancia / Perdida</th>
                  <th className="px-8 py-5 font-semibold text-right">Rendimiento</th>
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
                    <tr key={asset.ticker} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:border-primary/30 group-hover:shadow-[0_0_15px_rgba(26,92,255,0.2)] transition-all duration-300">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm tracking-tight">{asset.ticker}</p>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 font-medium uppercase tracking-wider">
                                {asset.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{asset.nativeCurrency}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right font-semibold tabular-nums text-sm">{asset.sharesOwned}</td>
                      <td className="px-6 py-6 text-right tabular-nums text-gray-400 text-sm">
                        {formatValue(avgPriceInView)}
                      </td>
                      <td className="px-6 py-6 text-right font-bold tabular-nums text-sm">
                        {formatValue(valueInView)}
                      </td>
                      <td className={`px-6 py-6 text-right font-bold tabular-nums text-sm ${isPositive ? 'text-emerald' : 'text-crimson'}`}>
                        {isPositive ? '+' : ''}{formatValue(pl)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs ${isPositive ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-crimson/10 text-crimson border border-crimson/20'}`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
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
