import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, DollarSign, ArrowRightLeft } from 'lucide-react';
import { cleanTickerName } from '../pages/Dashboard';

export const RecentActivityFeed: React.FC = () => {
  const { clientOperations } = usePortfolio();
  const { formatValue } = useCurrency();

  // Sort by date descending and take the last 10 operations
  const recentOps = [...clientOperations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getOperationDetails = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'BUY' || t === 'COMPRA') {
      return {
        icon: <ArrowDownRight className="w-4 h-4" />,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        label: 'Compra'
      };
    }
    if (t === 'SELL' || t === 'VENTA') {
      return {
        icon: <ArrowUpRight className="w-4 h-4" />,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        label: 'Venta'
      };
    }
    if (t === 'INCOME' || t === 'DIVIDENDO' || t === 'DIVIDENDOS') {
      return {
        icon: <DollarSign className="w-4 h-4" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        label: 'Dividendo'
      };
    }
    if (t === 'DEPOSIT' || t === 'DEPÓSITO' || t === 'DEPOSITO') {
      return {
        icon: <ArrowDownRight className="w-4 h-4" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        label: 'Fondeo'
      };
    }
    if (t === 'WITHDRAWAL' || t === 'RETIRO') {
      return {
        icon: <ArrowUpRight className="w-4 h-4" />,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        label: 'Retiro'
      };
    }
    
    return {
      icon: <ArrowRightLeft className="w-4 h-4" />,
      color: 'text-gray-400',
      bg: 'bg-white/10',
      label: type
    };
  };

  return (
    <div className="glass-card p-6 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl h-full shadow-2xl flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <RefreshCcw className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Actividad Reciente</h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Últimos movimientos</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide -mx-2 px-2 space-y-2">
        {recentOps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
            <RefreshCcw className="w-8 h-8 mb-3 text-white/50" />
            <p className="text-sm font-medium text-white/50">No hay actividad reciente</p>
          </div>
        ) : (
          recentOps.map((op, idx) => {
            const details = getOperationDetails(op.type);
            const totalValue = op.shares * op.price;
            const opCurrency = op.currency || op.originalCurrency || 'USD';
            const isGain = details.label === 'Venta' || details.label === 'Dividendo' || details.label === 'Fondeo';

            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${details.bg} ${details.color} border border-white/5`}>
                    {details.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-white">{details.label}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-medium uppercase tracking-wider">
                        {cleanTickerName(op.ticker)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                      {new Date(op.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold text-sm ${isGain ? 'text-emerald-400' : 'text-white'}`}>
                    {isGain ? '+' : '-'}{formatValue(totalValue, opCurrency as any)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {op.shares} unds a {formatValue(op.price, opCurrency as any)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
