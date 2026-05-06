import React from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const StrategyCompliance: React.FC = () => {
  const { clientPortfolio, totalNetWorthUSD } = usePortfolio();
  const { user } = useAuth();
  
  if (!user || user.role !== 'client') return null;

  const riskProfile = user.riskProfile || 'Moderado';

  const calculateAllocation = () => {
    let fixedIncome = 0;
    let equity = 0;
    
    clientPortfolio.forEach(asset => {
      // Valor en moneda base (simplificado a USD para porcentaje)
      const valueUSD = asset.nativeCurrency === 'USD' 
        ? asset.sharesOwned * asset.realTimePrice 
        : (asset.sharesOwned * asset.realTimePrice) / 16.5; 
      
      if (asset.type === 'Renta Fija') fixedIncome += valueUSD;
      if (asset.type === 'Renta Variable') equity += valueUSD;
    });

    const fixedPct = totalNetWorthUSD > 0 ? (fixedIncome / totalNetWorthUSD) * 100 : 0;
    const equityPct = totalNetWorthUSD > 0 ? (equity / totalNetWorthUSD) * 100 : 0;

    return { fixedPct, equityPct };
  };

  const { fixedPct, equityPct } = calculateAllocation();

  // Modelos ideales
  let targetFixed = 40;
  let targetEquity = 50;

  if (riskProfile === 'Conservador') {
    targetFixed = 70;
    targetEquity = 20;
  } else if (riskProfile === 'Agresivo') {
    targetFixed = 10;
    targetEquity = 70;
  }

  // Puntuación de cumplimiento
  const diffFixed = Math.abs(targetFixed - fixedPct);
  const diffEquity = Math.abs(targetEquity - equityPct);
  const complianceScore = Math.max(0, 100 - (diffFixed + diffEquity) / 2);

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Perfil y Estrategia
        </p>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold uppercase border border-primary/30 shadow-[0_0_10px_rgba(26,92,255,0.3)]">
          {riskProfile}
        </span>
      </div>
      
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-white">Cumplimiento del Modelo Ideal</span>
          <span className="text-xs font-bold text-primary-glow">{complianceScore.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 relative overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${complianceScore >= 80 ? 'bg-primary shadow-[0_0_10px_rgba(26,92,255,0.8)]' : complianceScore >= 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} 
            style={{ width: `${complianceScore}%` }}
          />
        </div>
      </div>
      
      {complianceScore < 80 && (
        <p className="text-[10px] text-gray-400 leading-tight">
          Tu cartera se desvía del modelo <strong>{riskProfile}</strong>. Considera un rebalanceo para mitigar riesgos.
        </p>
      )}
    </div>
  );
};
