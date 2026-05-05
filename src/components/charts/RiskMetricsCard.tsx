import React from 'react';
import { useRiskMetrics } from '../../hooks/useRiskMetrics';
import { ShieldAlert, TrendingDown, Activity, Target } from 'lucide-react';

export const RiskMetricsCard: React.FC = () => {
  const { sharpeRatio, maxDrawdown, volatility, beta } = useRiskMetrics();

  return (
    <div className="w-full h-[350px] glass-card p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white/80 font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Métricas de Riesgo
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Sharpe Ratio */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Sharpe Ratio</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {sharpeRatio.toFixed(2)}
            </p>
            <p className="text-[10px] text-white/40 mt-1">Retorno ajustado por riesgo</p>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Max Drawdown</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-400 tabular-nums">
              -{(maxDrawdown * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-white/40 mt-1">Caída máxima histórica</p>
          </div>
        </div>

        {/* Volatility */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Volatilidad Anual</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {(volatility * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-white/40 mt-1">Desviación estándar</p>
          </div>
        </div>

        {/* Beta */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Beta del Portafolio</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {beta.toFixed(2)}
            </p>
            <p className="text-[10px] text-white/40 mt-1">Sensibilidad vs Mercado</p>
          </div>
        </div>
      </div>
    </div>
  );
};
