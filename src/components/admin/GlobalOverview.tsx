import React from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Shield, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const GlobalOverview: React.FC = () => {
  const { allClients } = usePortfolio();
  const { formatValue, currency } = useCurrency();

  const clients = allClients.filter(c => c.role === 'client');

  let globalValueUSD = 0;
  let globalCostUSD = 0;

  let bestClient = { name: 'N/A', pnlPct: -Infinity, value: 0 };
  let worstClient = { name: 'N/A', pnlPct: Infinity, value: 0 };

  clients.forEach(client => {
    let clientValueUSD = 0;
    let clientCostUSD = 0;

    client.portfolio.forEach(asset => {
      const isUSD = asset.nativeCurrency === 'USD';
      const priceUSD = isUSD ? asset.realTimePrice : asset.realTimePrice / 16.5;
      const costUSD = isUSD ? asset.avgPurchasePriceUSD : asset.avgPurchasePriceUSD; // Wait, avgPurchasePriceUSD is stored

      clientValueUSD += asset.sharesOwned * priceUSD;
      clientCostUSD += asset.sharesOwned * (costUSD || 0);
    });

    globalValueUSD += clientValueUSD;
    globalCostUSD += clientCostUSD;

    if (clientCostUSD > 0) {
      const pnlPct = ((clientValueUSD - clientCostUSD) / clientCostUSD) * 100;
      if (pnlPct > bestClient.pnlPct) bestClient = { name: client.name, pnlPct, value: clientValueUSD };
      if (pnlPct < worstClient.pnlPct) worstClient = { name: client.name, pnlPct, value: clientValueUSD };
    }
  });

  const globalAUMDisplay = currency === 'USD' ? globalValueUSD : globalValueUSD * 16.5;
  const globalPnLUSD = globalValueUSD - globalCostUSD;
  const globalPnLDisplay = currency === 'USD' ? globalPnLUSD : globalPnLUSD * 16.5;
  const globalPnLPct = globalCostUSD > 0 ? (globalPnLUSD / globalCostUSD) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:p-8 col-span-1 md:col-span-1 relative overflow-hidden bg-white/[0.01]">
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Global AUM
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tabular-nums text-white mb-2">
              {formatValue(globalAUMDisplay)}
            </h2>
            <p className="text-xs text-gray-400">Activos Totales Bajo Administración</p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent flex items-center justify-end pr-8">
            <Shield className="w-24 h-24 text-primary/10 rotate-12" />
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 relative overflow-hidden bg-white/[0.01]">
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs text-emerald font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Global PnL
            </p>
            <h2 className={`text-3xl md:text-4xl font-bold tabular-nums mb-2 ${globalPnLDisplay >= 0 ? 'text-emerald' : 'text-crimson'}`}>
              {globalPnLDisplay >= 0 ? '+' : ''}{formatValue(globalPnLDisplay)}
            </h2>
            <p className="text-xs text-gray-400">
              <span className={globalPnLPct >= 0 ? 'text-emerald font-bold' : 'text-crimson font-bold'}>
                {globalPnLPct >= 0 ? '+' : ''}{globalPnLPct.toFixed(2)}%
              </span>{' '}
              Retorno Global Estimado
            </p>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 flex flex-col justify-center space-y-4 bg-white/[0.01]">
          <div>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-emerald" /> Top Portfolio
            </p>
            <div className="flex justify-between items-end">
              <p className="text-sm font-bold text-white truncate">{bestClient.name}</p>
              <p className="text-xs text-emerald font-bold">+{bestClient.pnlPct === -Infinity ? 0 : bestClient.pnlPct.toFixed(2)}%</p>
            </div>
          </div>
          <div className="h-px w-full bg-white/10" />
          <div>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <TrendingDown className="w-3 h-3 text-crimson" /> Bottom Portfolio
            </p>
            <div className="flex justify-between items-end">
              <p className="text-sm font-bold text-white truncate">{worstClient.name}</p>
              <p className="text-xs text-crimson font-bold">{worstClient.pnlPct === Infinity ? 0 : worstClient.pnlPct.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
