import React, { useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Search, FileDigit, Calendar, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

export const AuditLog: React.FC = () => {
  const { allOperations } = usePortfolio();
  const { formatValue } = useCurrency();
  const [searchId, setSearchId] = useState('');

  // Filter operations. Ensure we only show ones with an orderId or id if orderId is missing for older data.
  const filteredOps = allOperations
    .filter(op => {
      const oid = op.orderId || op.id || '';
      return searchId ? oid.toLowerCase().includes(searchId.toLowerCase()) : true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 md:p-8 bg-white/[0.01]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <FileDigit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registro de Auditoría</h2>
              <p className="text-xs text-gray-400">Trazabilidad estricta por ID de Pedido</p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Buscar por ID de Pedido..." 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="glass-input pl-11 w-full text-sm py-2"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-white/50 text-[10px] uppercase tracking-widest bg-white/[0.01]">
                <th className="px-6 py-4 font-semibold">ID Pedido</th>
                <th className="px-4 py-4 font-semibold">Fecha</th>
                <th className="px-4 py-4 font-semibold">Cliente ID</th>
                <th className="px-4 py-4 font-semibold">Tipo</th>
                <th className="px-4 py-4 font-semibold">Activo</th>
                <th className="px-4 py-4 font-semibold text-right">Cantidad</th>
                <th className="px-4 py-4 font-semibold text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOps.length > 0 ? (
                filteredOps.map((op, idx) => {
                  const oid = op.orderId || op.id || 'N/A';
                  const isBuy = op.type === 'Buy' || op.type === 'Compra';
                  const isSell = op.type === 'Sell' || op.type === 'Venta';
                  
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-orange-400/80 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                            {oid}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {new Date(op.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{op.clientId.slice(0,8)}...</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : isSell ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : isSell ? <TrendingDown className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3" />}
                          {op.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{op.ticker}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm text-white">{op.shares}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-sm text-white">{formatValue(op.price, op.currency as 'USD' | 'MXN')}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron operaciones con ese ID.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
