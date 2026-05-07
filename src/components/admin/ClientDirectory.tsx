import React, { useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth, type ClientProfile } from '../../contexts/AuthContext';
import { ChevronDown, ChevronUp, Save, LogIn } from 'lucide-react';
import { updateKYC } from '../../services/sheetsService';
import toast from 'react-hot-toast';

const ClientDirectory: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const { allClients } = usePortfolio();
  const { formatValue, currency } = useCurrency();
  const { impersonateClient } = useAuth();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [kycForm, setKycForm] = useState({ investmentHorizon: '', liquidityNeeds: '', lastCommunication: '' });
  const [isSaving, setIsSaving] = useState(false);

  const clients = allClients.filter(c => 
    c.role === 'client' && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (client: any) => {
    if (expandedId === client.id) {
      setExpandedId(null);
    } else {
      setExpandedId(client.id);
      setKycForm({
        investmentHorizon: client.investmentHorizon || '',
        liquidityNeeds: client.liquidityNeeds || '',
        lastCommunication: client.lastCommunication || ''
      });
    }
  };

  const handleSaveKYC = async (clientId: string) => {
    setIsSaving(true);
    const success = await updateKYC(clientId, kycForm);
    if (success) {
      toast.success('Expediente KYC actualizado correctamente');
    } else {
      toast.error('Error al actualizar el expediente');
    }
    setIsSaving(false);
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in bg-white/[0.01]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-[#0B0B0B] border-b border-white/5">
            <tr className="text-gray-500 text-[10px] uppercase tracking-widest">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-right">Balance Total</th>
              <th className="px-6 py-4 text-right">Rendimiento (%)</th>
              <th className="px-6 py-4 text-center">Nivel de Riesgo</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map(client => {
              let clientValueUSD = 0;
              let clientCostUSD = 0;
              client.portfolio.forEach(asset => {
                const isUSD = asset.nativeCurrency === 'USD';
                const priceUSD = isUSD ? asset.realTimePrice : asset.realTimePrice / 16.5;
                const costUSD = isUSD ? asset.avgPurchasePriceUSD : asset.avgPurchasePriceUSD;
                clientValueUSD += asset.sharesOwned * priceUSD;
                clientCostUSD += asset.sharesOwned * (costUSD || 0);
              });

              const pnlPct = clientCostUSD > 0 ? ((clientValueUSD - clientCostUSD) / clientCostUSD) * 100 : 0;
              const displayValue = currency === 'USD' ? clientValueUSD : clientValueUSD * 16.5;

              return (
                <React.Fragment key={client.id}>
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{client.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-sm">
                      {formatValue(displayValue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold tabular-nums px-2 py-1 rounded-lg ${pnlPct >= 0 ? 'bg-emerald/10 text-emerald' : 'bg-crimson/10 text-crimson'}`}>
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {client.riskProfile || 'Moderado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => toggleExpand(client)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          title="Expediente KYC"
                        >
                          {expandedId === client.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => {
                            if (impersonateClient) {
                                impersonateClient(client as ClientProfile);
                                window.location.href = '/dashboard'; // Redirect
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-colors"
                          title="Ver como Cliente"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedId === client.id && (
                    <tr className="bg-[#0B0B0B]/50">
                      <td colSpan={5} className="px-6 py-6 border-b border-white/5">
                        <div className="max-w-3xl border-l-2 border-primary/50 pl-6 py-2 space-y-4">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Expediente KYC</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Horizonte de Inversión</label>
                              <input 
                                type="text"
                                value={kycForm.investmentHorizon}
                                onChange={e => setKycForm({...kycForm, investmentHorizon: e.target.value})}
                                className="glass-input w-full text-sm py-2 px-3"
                                placeholder="Ej. Largo Plazo (5+ años)"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Necesidades de Liquidez</label>
                              <input 
                                type="text"
                                value={kycForm.liquidityNeeds}
                                onChange={e => setKycForm({...kycForm, liquidityNeeds: e.target.value})}
                                className="glass-input w-full text-sm py-2 px-3"
                                placeholder="Ej. Retiros trimestrales"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Última Comunicación</label>
                              <input 
                                type="text"
                                value={kycForm.lastCommunication}
                                onChange={e => setKycForm({...kycForm, lastCommunication: e.target.value})}
                                className="glass-input w-full text-sm py-2 px-3"
                                placeholder="Ej. 15-May-2024"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button 
                              onClick={() => handleSaveKYC(client.id)}
                              disabled={isSaving}
                              className="glass-button flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold"
                            >
                              {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Save className="w-4 h-4" />}
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDirectory;
