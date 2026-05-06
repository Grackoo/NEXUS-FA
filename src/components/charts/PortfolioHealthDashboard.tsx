import React from 'react';
import { PnLBarChart } from './PnLBarChart';
import { RiskMetricsCard } from './RiskMetricsCard';
import { StrategyCompliance } from './StrategyCompliance';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Coins } from 'lucide-react';

export const PortfolioHealthDashboard: React.FC = () => {
  const { estimatedAnnualDividendsUSD } = usePortfolio();
  const { formatValue, currency } = useCurrency();
  
  // Si la vista está en MXN, convertimos el estimado de dividendos (asumiendo TC 16.5 para simplificar aquí)
  const dividendsDisplay = currency === 'USD' ? estimatedAnnualDividendsUSD : estimatedAnnualDividendsUSD * 16.5;
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Análisis Adicional</h2>
        <p className="text-gray-400 text-sm mt-1">Rendimiento, riesgo y diversificación.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PnLBarChart />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <RiskMetricsCard />
          <StrategyCompliance />
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins className="w-16 h-16 text-primary" />
             </div>
             <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 relative z-10">
               Ingresos Pasivos (Estimado Anual)
             </p>
             <h3 className="text-3xl font-bold text-emerald-400 tabular-nums relative z-10 mb-1">
               {formatValue(dividendsDisplay)}
             </h3>
             <p className="text-[10px] text-gray-500 relative z-10 max-w-[80%]">
               Proyección basada en los rendimientos por dividendos (Yield) de los activos elegibles en el portafolio actual.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
