import React from 'react';
import { PnLBarChart } from './PnLBarChart';
import { RiskMetricsCard } from './RiskMetricsCard';
import { StrategyCompliance } from './StrategyCompliance';
import { DividendProjectionChart } from './DividendProjectionChart';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 h-full">
          <PnLBarChart />
        </div>
        <div className="md:col-span-1 h-full">
          <RiskMetricsCard />
        </div>
        <div className="md:col-span-1 space-y-6 flex flex-col h-full">
          <StrategyCompliance />
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col flex-1 min-h-[180px] max-h-[220px]">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins className="w-12 h-12 text-primary" />
             </div>
             <div className="relative z-10 mb-2">
               <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                 Ingresos Pasivos (Estimado Anual)
               </p>
               <h3 className="text-3xl font-bold text-emerald-400 tabular-nums mb-1">
                 {formatValue(dividendsDisplay)}
               </h3>
               <p className="text-[10px] text-gray-500 max-w-[80%]">
                 Proyección basada en rendimientos por dividendos.
               </p>
             </div>
             <div className="flex-1 w-full min-h-0 relative z-10 -ml-2">
               <DividendProjectionChart />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
