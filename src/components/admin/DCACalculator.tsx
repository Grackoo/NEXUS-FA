import React, { useState } from 'react';
import { Calculator, Target, Info } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

export const DCACalculator: React.FC = () => {
  const { formatValue } = useCurrency();
  const [ticker, setTicker] = useState('');
  const [targetAvg, setTargetAvg] = useState('');
  const [currentMarketPrice, setCurrentMarketPrice] = useState('');
  const [currentShares, setCurrentShares] = useState('');
  const [currentAvgPrice, setCurrentAvgPrice] = useState('');
  const [maxInvestment, setMaxInvestment] = useState('');

  const [result, setResult] = useState<{shares: number, totalCost: number, newAvg: number, hitLimit: boolean} | null>(null);

  const calculateDCA = (e: React.FormEvent) => {
    e.preventDefault();
    const tAvg = parseFloat(targetAvg);
    const mPrice = parseFloat(currentMarketPrice);
    const shares = parseFloat(currentShares);
    const cAvg = parseFloat(currentAvgPrice);
    const maxInv = parseFloat(maxInvestment) || Infinity;

    if (tAvg >= cAvg) {
      alert("El precio objetivo debe ser menor al precio promedio actual para promediar a la baja.");
      return;
    }
    if (mPrice >= tAvg) {
      alert("El precio de mercado actual debe ser menor al precio objetivo para poder alcanzarlo.");
      return;
    }

    // Formula to find required shares X:
    // (shares * cAvg + X * mPrice) / (shares + X) = tAvg
    // shares * cAvg + X * mPrice = tAvg * shares + tAvg * X
    // X * (tAvg - mPrice) = shares * (cAvg - tAvg)
    // X = shares * (cAvg - tAvg) / (tAvg - mPrice)
    
    let requiredShares = shares * (cAvg - tAvg) / (tAvg - mPrice);
    let totalCost = requiredShares * mPrice;
    let hitLimit = false;

    if (totalCost > maxInv) {
      totalCost = maxInv;
      requiredShares = maxInv / mPrice;
      hitLimit = true;
    }

    const newAvg = (shares * cAvg + requiredShares * mPrice) / (shares + requiredShares);

    setResult({
      shares: requiredShares,
      totalCost,
      newAvg,
      hitLimit
    });
  };

  return (
    <div className="glass-card p-6 md:p-8 bg-[#0B0B0B]/40 border-blue-500/20 relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Calculadora DCA Avanzada</h2>
          <p className="text-xs text-gray-400">Calcula cuántas acciones comprar para tu Precio Promedio Objetivo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <form onSubmit={calculateDCA} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ticker</label>
              <input type="text" required value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. TSLA"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Acciones Actuales</label>
              <input type="number" step="any" required value={currentShares} onChange={e=>setCurrentShares(e.target.value)} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. 10"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Precio Promedio Actual</label>
              <input type="number" step="any" required value={currentAvgPrice} onChange={e=>setCurrentAvgPrice(e.target.value)} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. 250"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Precio Promedio Objetivo</label>
              <input type="number" step="any" required value={targetAvg} onChange={e=>setTargetAvg(e.target.value)} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. 200"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Precio de Mercado (Hoy)</label>
              <input type="number" step="any" required value={currentMarketPrice} onChange={e=>setCurrentMarketPrice(e.target.value)} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. 150"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-between">Inversión Máx <span className="text-gray-600 text-[8px]">(Opcional)</span></label>
              <input type="number" step="any" value={maxInvestment} onChange={e=>setMaxInvestment(e.target.value)} className="glass-input w-full py-2 px-3 text-sm" placeholder="Ej. 5000"/>
            </div>
          </div>
          <button type="submit" className="w-full glass-button flex items-center justify-center gap-2 py-3 mt-4">
            <Target className="w-4 h-4"/> Calcular DCA
          </button>
        </form>

        <div className="flex flex-col justify-center">
          {result ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4 relative overflow-hidden">
              {result.hitLimit && (
                <div className="absolute top-0 inset-x-0 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest text-center py-1">
                  Límite de Inversión Alcanzado
                </div>
              )}
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Plan de Compra: {ticker || 'Activo'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Acciones a Comprar</p>
                  <p className="text-2xl font-bold text-blue-400">{result.shares.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Costo Estimado</p>
                  <p className="text-2xl font-bold text-white">{formatValue(result.totalCost, 'USD')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Nuevo Promedio</p>
                  <p className={`text-lg font-bold ${result.hitLimit ? 'text-yellow-400' : 'text-emerald-400'}`}>{formatValue(result.newAvg, 'USD')}</p>
                  {result.hitLimit && <p className="text-xs text-gray-500 mt-1"><Info className="w-3 h-3 inline mr-1"/>No alcanzó el objetivo debido al límite de inversión.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-600 text-sm">
              <p>Ingresa los datos para calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DCACalculator;
