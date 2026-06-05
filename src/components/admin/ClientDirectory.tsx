import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth, type ClientProfile } from '../../contexts/AuthContext';
import { ChevronDown, ChevronUp, Save, LogIn, Eye, FileText, X, Pencil, Check, UserCheck } from 'lucide-react';
import { updateKYC, submitOperation } from '../../services/sheetsService';
import toast from 'react-hot-toast';
import { prepareReportData } from '../../services/reportService';
import { useAdvisorNotes } from '../../hooks/useAdvisorNotes';

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

  const { notes, updateNote } = useAdvisorNotes();
  const [advisorNoteForm, setAdvisorNoteForm] = useState('');

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
      setAdvisorNoteForm(notes[client.id]?.note || '');
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

    if (advisorNoteForm.trim() !== '') {
      updateNote(clientId, advisorNoteForm.trim());
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-primary" />
          Directorio de Inversionistas
          <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold">
            {clients.length} ACTIVOS
          </span>
        </h2>
      </div>
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
                            
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-6 mb-4">Resumen Ejecutivo (Nota del Asesor)</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Anotación para el Cliente</label>
                                  {notes[client.id] && (
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${notes[client.id].isRead ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                      {notes[client.id].isRead ? `Leído el ${new Date(notes[client.id].readAt!).toLocaleDateString()}` : 'Pendiente de Lectura'}
                                    </span>
                                  )}
                                </div>
                                <textarea 
                                  value={advisorNoteForm}
                                  onChange={e => setAdvisorNoteForm(e.target.value)}
                                  className="glass-input w-full text-sm py-2 px-3 h-24 resize-none"
                                  placeholder="Ej. Estimado cliente, su portafolio mantiene una fuerte exposición en tecnología..."
                                />
                                <p className="text-[9px] text-gray-500 mt-1">El cliente verá este mensaje en su pantalla principal y deberá confirmar de enterado.</p>
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

      <div className="mt-12 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-primary" />
          Llaves de Acceso y Contacto
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {clients.map(client => {
          const waPhone = client.phone?.replace(/\D/g, '');
          const waLink = waPhone ? `https://wa.me/${waPhone}?text=Hola%20${encodeURIComponent(client.name)},%20te%20contacto%20desde%20Nexus%20FA.` : '#';

          return (
            <div key={`keys-${client.id}`} className="glass-card p-6 bg-white/[0.01] flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{client.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{client.id}</p>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contraseña de Acceso</label>
                    <div className="glass-input w-full text-sm py-2 px-3 font-mono text-emerald-400 select-all">
                      {client.password || 'No asignada'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Super Link (Acceso Directo)</label>
                    <div className="glass-input w-full text-sm py-2 px-3 font-mono text-blue-400 truncate cursor-pointer hover:bg-white/5 transition-colors"
                         onClick={(e) => {
                           const url = `${window.location.origin}/?id=${client.id}&pass=${client.password}`;
                           navigator.clipboard.writeText(url);
                           const target = e.target as HTMLElement;
                           const originalText = target.innerText;
                           target.innerText = '¡Copiado!';
                           setTimeout(() => { target.innerText = originalText; }, 2000);
                         }}
                         title="Clic para copiar enlace mágico">
                      {`${window.location.origin}/?id=${client.id}&pass=...`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                    <p className="text-xs text-gray-300 truncate" title={client.email}>{client.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Teléfono</label>
                    <p className="text-xs text-gray-300">{client.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass-button w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold ${!waPhone ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          );
        })}
        {clients.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 text-sm glass-card bg-white/[0.01]">
            No se encontraron clientes para mostrar las llaves de acceso.
          </div>
        )}
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
