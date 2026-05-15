import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth, type ClientProfile } from '../../contexts/AuthContext';
import { ChevronDown, ChevronUp, Save, LogIn, Eye, FileText, X, Pencil, Check } from 'lucide-react';
import { updateKYC, submitOperation } from '../../services/sheetsService';
import toast from 'react-hot-toast';
import { prepareReportData } from '../../services/reportService';

import ClientReportModal from './ClientReportModal';

const ClientDirectory: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const { allClients } = usePortfolio();
  const { formatValue, currency } = useCurrency();
  const { impersonateClient } = useAuth();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [kycForm, setKycForm] = useState({ investmentHorizon: '', liquidityNeeds: '', lastCommunication: '' });
  const [contractUrlForm, setContractUrlForm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

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
      setContractUrlForm(localStorage.getItem(`contractUrl_${client.id}`) || '');
    }
  };

  const handleSaveKYC = async (clientId: string) => {
    setIsSaving(true);
    // Guardar URL de contrato en localStorage para la demo
    if (contractUrlForm.trim() !== '') {
      localStorage.setItem(`contractUrl_${clientId}`, contractUrlForm.trim());
    } else {
      localStorage.removeItem(`contractUrl_${clientId}`);
    }

    const success = await updateKYC(clientId, kycForm);
    if (success) {
      toast.success('Expediente KYC y documentos actualizados correctamente');
    } else {
      toast.error('Error al actualizar el expediente');
    }
    setIsSaving(false);
  };

  const handleOpenAssetsModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsAssetsModalOpen(true);
  };

  const handleExportPDF = (client: any, totalUSD: number, totalMXN: number) => {
    const data = prepareReportData(client, client.operations || [], totalUSD, totalMXN, 16.5);
    setReportData(data);
  };

  return (
    <>
      <div className="glass-card overflow-hidden animate-fade-in bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
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
                const totalMXN = clientValueUSD * 16.5;

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
                            onClick={() => handleOpenAssetsModal(client.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            title="Desglose de Cartera"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleExportPDF(client, clientValueUSD, totalMXN)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-emerald hover:bg-emerald/10 transition-colors"
                            title="Generar Reporte PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (impersonateClient) {
                                  impersonateClient(client as ClientProfile);
                                  window.location.href = '/dashboard'; 
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
                            
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-6 mb-4">Documentos Legales</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Enlace del Contrato (PDF/Drive)</label>
                                <input 
                                  type="text"
                                  value={contractUrlForm}
                                  onChange={e => setContractUrlForm(e.target.value)}
                                  className="glass-input w-full text-sm py-2 px-3"
                                  placeholder="https://drive.google.com/..."
                                />
                                <p className="text-[9px] text-gray-500 mt-1">Este enlace aparecerá en la Bóveda de Documentos del cliente.</p>
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

      {isAssetsModalOpen && selectedClientId && (
        <AssetBreakdownModal 
          clientId={selectedClientId}
          clientName={allClients.find(c => c.id === selectedClientId)?.name || ''}
          portfolio={allClients.find(c => c.id === selectedClientId)?.portfolio || []}
          onClose={() => setIsAssetsModalOpen(false)}
        />
      )}

      {reportData && (
        <ClientReportModal 
          reportData={reportData} 
          onClose={() => setReportData(null)} 
        />
      )}
    </>
  );
};

const AssetBreakdownModal: React.FC<{ 
  clientId: string; 
  clientName: string; 
  portfolio: any[]; 
  onClose: () => void;
}> = ({ clientId, clientName, portfolio, onClose }) => {
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editData, setEditData] = useState({ shares: 0, price: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEdit = (asset: any) => {
    setEditingTicker(asset.ticker);
    setEditData({ shares: asset.sharesOwned, price: asset.avgPurchasePriceUSD });
  };

  const saveEdit = async (asset: any) => {
    if (editData.shares < 0) {
      toast.error('Inventario inválido: El balance del activo no puede quedar en negativo.');
      return;
    }

    setIsSubmitting(true);
    const success = await submitOperation({
      clientId,
      type: 'Adjustment',
      assetType: asset.type,
      ticker: asset.ticker,
      shares: editData.shares,
      price: editData.price,
      commission: 0,
      originalCurrency: asset.nativeCurrency
    });

    if (success) {
      setEditingTicker(null);
    }
    setIsSubmitting(false);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="glass-card w-full max-w-3xl p-0 overflow-hidden shadow-2xl border-white/10 animate-fade-in mx-auto">
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="max-w-[80%]">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 truncate">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                {clientName}
              </h2>
              <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest font-bold">Desglose de Cartera</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-0 overflow-x-auto overflow-y-auto max-h-[60vh] scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead className="sticky top-0 bg-[#0B0B0B] z-10 border-b border-white/5">
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="px-6 md:px-8 py-4">Símbolo</th>
                <th className="px-4 py-4 text-right">Cantidad</th>
                <th className="px-4 py-4 text-right">Costo (USD)</th>
                <th className="px-6 md:px-8 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {portfolio.map(asset => (
                <tr key={asset.ticker} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 md:px-8 py-4">
                    <p className="font-bold text-sm text-primary">{asset.ticker}</p>
                    <p className="text-[9px] text-gray-500 font-medium uppercase">{asset.type}</p>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-xs md:text-sm">
                    {editingTicker === asset.ticker ? (
                      <input 
                        type="number" 
                        value={editData.shares} 
                        onChange={e => setEditData({...editData, shares: Number(e.target.value)})}
                        className="glass-input w-20 text-right py-1 px-2 text-xs"
                      />
                    ) : asset.sharesOwned}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-xs md:text-sm">
                    {editingTicker === asset.ticker ? (
                      <input 
                        type="number" 
                        value={editData.price} 
                        onChange={e => setEditData({...editData, price: Number(e.target.value)})}
                        className="glass-input w-20 text-right py-1 px-2 text-xs"
                      />
                    ) : `$${asset.avgPurchasePriceUSD.toFixed(1)}`}
                  </td>
                  <td className="px-6 md:px-8 py-4 text-center">
                    {editingTicker === asset.ticker ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          disabled={isSubmitting}
                          onClick={() => saveEdit(asset)} 
                          className={`p-1.5 bg-emerald/20 text-emerald rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald/30'}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingTicker(null)} className="p-1.5 bg-crimson/20 text-crimson rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(asset)} className="p-1.5 bg-white/5 text-gray-400 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ClientDirectory;
