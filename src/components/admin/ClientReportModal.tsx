import React from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const ClientReportModal: React.FC<{ 
  reportData: any; 
  onClose: () => void;
}> = ({ reportData, onClose }) => {
  if (!reportData) return null;

  return createPortal(
    <div className="modal-overlay print:p-0 print:bg-white print:block">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0B0B0B] p-0 shadow-2xl border-white/10 mx-auto print:p-0 print:m-0 print:shadow-none print:border-none print:max-h-none print:bg-white print:text-black">
        
        {/* Modal Header (Hidden when printing) */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] print:hidden">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-emerald" /> Reporte Generado
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="glass-button emerald py-2 px-4 text-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div id="printable-report" className="p-8 md:p-12 space-y-8 bg-white text-black min-h-[800px] print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">NEXUS FA</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Wealth Management</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-gray-900">{reportData.clientName}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {reportData.clientId}</p>
              <p className="text-xs text-gray-500 mt-1">{reportData.reportDate}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Patrimonio Total (USD)</p>
              <p className="text-3xl font-black text-gray-900">{reportData.totals.netWorthUSD}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Patrimonio Total (MXN)</p>
              <p className="text-3xl font-black text-gray-900">{reportData.totals.netWorthMXN}</p>
            </div>
          </div>

          {/* Allocation */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Distribución de Activos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="py-2 font-bold uppercase tracking-wider text-xs">Clase de Activo</th>
                    <th className="py-2 text-right font-bold uppercase tracking-wider text-xs">Valor (MXN)</th>
                    <th className="py-2 text-right font-bold uppercase tracking-wider text-xs">% Portafolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.allocation.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10B981', '#1A5CFF', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'][idx % 6] }} />
                        {item.assetType}
                      </td>
                      <td className="py-3 text-right tabular-nums text-gray-700">{item.valueMXN}</td>
                      <td className="py-3 text-right font-bold tabular-nums text-gray-900">{item.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.allocation}
                      dataKey="value"
                      nameKey="assetType"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {reportData.allocation.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#1A5CFF', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'][index % 6]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Operations */}
          {reportData.recentOperations && reportData.recentOperations.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Últimas Operaciones</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="py-2 font-bold uppercase tracking-wider text-xs">Fecha</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-xs">Tipo</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-xs">Activo</th>
                    <th className="py-2 text-right font-bold uppercase tracking-wider text-xs">Cantidad</th>
                    <th className="py-2 text-right font-bold uppercase tracking-wider text-xs">Total (MXN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.recentOperations.map((op: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 text-gray-600">{op.date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${op.type === 'Compra' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {op.type}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-gray-900">{op.ticker}</td>
                      <td className="py-3 text-right tabular-nums text-gray-700">{op.shares}</td>
                      <td className="py-3 text-right tabular-nums text-gray-900 font-medium">{op.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="pt-12 text-center text-xs text-gray-400 mt-auto">
            <p>Este documento es generado automáticamente por la plataforma Nexus FA y es de carácter estrictamente confidencial.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ClientReportModal;
