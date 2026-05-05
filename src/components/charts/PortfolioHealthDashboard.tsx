import React from 'react';
import { PnLBarChart } from './PnLBarChart';
import { RiskMetricsCard } from './RiskMetricsCard';

export const PortfolioHealthDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Análisis Adicional</h2>
        <p className="text-gray-400 text-sm mt-1">Rendimiento, riesgo y diversificación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <PnLBarChart />
        </div>
        <div className="lg:col-span-1">
          <RiskMetricsCard />
        </div>
      </div>
    </div>
  );
};
