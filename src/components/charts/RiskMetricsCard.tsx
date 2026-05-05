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
        <div className="relative group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between cursor-help transition-all hover:bg-white/10 hover:border-white/20">
          <div className="flex items-center gap-2 text-white/50 mb-2 group-hover:text-primary transition-colors">
            <Target className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Sharpe Ratio</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {sharpeRatio.toFixed(2)}
            </p>
            <p className="text-[10px] text-white/40 mt-1">Retorno ajustado por riesgo</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-800 text-white/90 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/10 z-20 pointer-events-none text-center">
             Mide el exceso de rendimiento en relación al riesgo asumido. Un valor superior a 1.0 se considera bueno, y superior a 2.0 es excelente.
             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="relative group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between cursor-help transition-all hover:bg-white/10 hover:border-white/20">
          <div className="flex items-center gap-2 text-white/50 mb-2 group-hover:text-rose-400 transition-colors">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Max Drawdown</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-400 tabular-nums">
              -{(maxDrawdown * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-white/40 mt-1">Caída máxima esperada</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-800 text-white/90 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/10 z-20 pointer-events-none text-center">
             La mayor caída porcentual calculada estadísticamente. Indica el peor escenario de pérdida esperado basado en tu nivel de volatilidad.
             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>

        {/* Volatility */}
        <div className="relative group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between cursor-help transition-all hover:bg-white/10 hover:border-white/20">
          <div className="flex items-center gap-2 text-white/50 mb-2 group-hover:text-amber-400 transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Volatilidad Anual</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {(volatility * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-white/40 mt-1">Desviación estándar de los activos</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-800 text-white/90 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/10 z-20 pointer-events-none text-center">
             Estimación de cuánto podría variar el valor de tu portafolio en un año. A mayor porcentaje, mayor potencial de ganancia, pero también mayor riesgo.
             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>

        {/* Beta */}
        <div className="relative group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between cursor-help transition-all hover:bg-white/10 hover:border-white/20">
          <div className="flex items-center gap-2 text-white/50 mb-2 group-hover:text-cyan-400 transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">Beta del Portafolio</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {beta.toFixed(2)}
            </p>
            <p className="text-[10px] text-white/40 mt-1">Sensibilidad vs Mercado</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-slate-800 text-white/90 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/10 z-20 pointer-events-none text-center">
             Mide cómo se mueve tu portafolio frente al mercado (S&P500). Un Beta de 1.0 significa que se mueve igual; mayor a 1.0 indica que es más volátil/agresivo que el promedio.
             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
