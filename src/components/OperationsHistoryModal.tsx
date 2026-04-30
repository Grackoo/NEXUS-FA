import React from 'react';
import { X, History, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  clientId: string;
}

const OperationsHistoryModal: React.FC<Props> = ({ isOpen, onClose, ticker, clientId }) => {
  const { allOperations } = usePortfolio();
  const { formatValue } = useCurrency();

  if (!isOpen) return null;

  // Filter operations for this specific client and ticker
  const operations = allOperations
    .filter(op => op.clientId === clientId && op.ticker === ticker)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="modal-overlay animate-fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="glass-card w-full max-w-5xl p-0 overflow-hidden flex flex-col h-[85vh]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Historial de Operaciones
            </h2>
            <p className="text-sm text-gray-400 mt-1">Activo: <span className="text-white font-semibold">{ticker}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {operations.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No hay operaciones registradas para este activo.
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((op, idx) => {
                const isBuy = op.type === 'Buy' || op.type === 'Compra';
                const isSell = op.type === 'Sell' || op.type === 'Venta';
                
                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isBuy ? 'bg-emerald-500/10' : isSell ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
                        {isBuy ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : 
                         isSell ? <TrendingDown className="w-5 h-5 text-rose-400" /> : 
                         <RefreshCcw className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{op.type}</p>
                        <p className="text-xs text-gray-400">{new Date(op.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {isBuy ? '+' : isSell ? '-' : ''}{op.shares} Acciones
                      </p>
                      <p className="text-xs text-gray-400">
                        Precio: {formatValue(op.price, op.currency as 'USD' | 'MXN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OperationsHistoryModal;
