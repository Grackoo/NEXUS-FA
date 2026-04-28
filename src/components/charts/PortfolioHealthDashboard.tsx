import React from 'react';
import { AllocationDonut } from './AllocationDonut';
import { PerformanceArea } from './PerformanceArea';
import { PnLBarChart } from './PnLBarChart';

export const PortfolioHealthDashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Salud del Portafolio</h2>
        <p className="text-gray-400 text-sm mt-1">Análisis avanzado de rendimiento, riesgo y diversificación.</p>
      </div>

      {/* Top Row: Performance (Span 2) & Allocation (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceArea />
        </div>
        <div className="lg:col-span-1">
          <AllocationDonut />
        </div>
      </div>

      {/* Bottom Row: PnL Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <PnLBarChart />
        </div>
        {/* Placeholder for future charts */}
        <div className="w-full h-[350px] glass-card p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-white/40 text-2xl">+</span>
          </div>
          <h3 className="text-white/80 font-semibold text-sm uppercase tracking-widest">Métrica Adicional</h3>
          <p className="text-white/40 text-xs mt-2 max-w-[200px]">Espacio reservado para análisis de riesgo (Sharpe Ratio, Volatilidad, etc).</p>
        </div>
      </div>
    </div>
  );
};
