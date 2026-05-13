import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Target, Edit2, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const GoalTracker: React.FC = () => {
  const { totalNetWorthMXN, totalNetWorthUSD } = usePortfolio();
  const { currency, formatValue } = useCurrency();
  
  const [isEditing, setIsEditing] = useState(false);
  const [goalName, setGoalName] = useState('Libertad Financiera');
  const [targetAmount, setTargetAmount] = useState(100000); // En MXN o USD según prefiera el usuario. Para simplificar, lo guardamos en la moneda actual.
  
  // En un caso real, esto vendría del servidor y estaría ligado al cliente y la moneda de la meta.
  // Por ahora lo simulamos guardándolo en localStorage.
  useEffect(() => {
    const saved = localStorage.getItem('nexus_client_goal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setGoalName(parsed.name);
        if (parsed.amount) setTargetAmount(parsed.amount);
      } catch (e) {}
    }
  }, []);

  const saveGoal = () => {
    localStorage.setItem('nexus_client_goal', JSON.stringify({ name: goalName, amount: targetAmount }));
    setIsEditing(false);
  };

  const currentAmount = currency === 'USD' ? totalNetWorthUSD : totalNetWorthMXN;
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  
  const data = [
    { name: 'Progress', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];

  return (
    <div className="glass-card p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Proyección de Metas</h2>
            <p className="text-xs text-gray-400">Rastreador de progreso</p>
          </div>
        </div>
        <button 
          onClick={() => isEditing ? saveGoal() : setIsEditing(true)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          {isEditing ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {isEditing ? (
          <div className="w-full space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre de la Meta</label>
              <input 
                type="text" 
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="glass-input w-full text-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Monto Objetivo ({currency})</label>
              <input 
                type="number" 
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="glass-input w-full text-sm py-2 px-3"
              />
            </div>
          </div>
        ) : (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="cell-0" fill="#06B6D4" style={{ filter: 'drop-shadow(0px 0px 8px rgba(6,182,212,0.8))' }} />
                  <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                {percentage.toFixed(1)}%
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Completado</span>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="mt-6 space-y-2 relative z-10 text-center">
          <p className="text-sm font-bold text-white tracking-wide">{goalName}</p>
          <p className="text-xs text-gray-400">
            {formatValue(currentAmount)} <span className="mx-1 text-gray-600">/</span> {formatValue(targetAmount)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
