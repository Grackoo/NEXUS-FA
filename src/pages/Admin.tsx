import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Users, Search, Plus, ArrowUpRight, BarChart3, AlertCircle, Shield, Eye, Pencil, Check, X, PlusCircle, Info } from 'lucide-react';
import SmartTransactionModal from '../components/SmartTransactionModal.tsx';
import { submitOperation } from '../services/sheetsService';

const Admin: React.FC = () => {
  const { allClients } = usePortfolio();
  const { formatValue, currency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddClientInfo, setShowAddClientInfo] = useState(false);

  const filteredClients = allClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && c.role === 'client'
  );

  const handleOpenTxModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsTxModalOpen(true);
  };

  const handleOpenAssetsModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsAssetsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-10 space-y-6 md:space-y-10 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
               <Shield className="w-4 h-4" /> Management Console
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">Administración Global</h1>
            <p className="text-gray-400 text-xs md:text-sm max-w-lg">Supervisión integral de carteras y gestión de riesgos estratégica para el fondo.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="glass-input pl-11 w-full md:w-64 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button 
              onClick={() => setShowAddClientInfo(true)}
              className="glass-button flex items-center justify-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md\:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredClients.map(client => {
            const totalUSD = client.portfolio.reduce((acc, asset) => {
                return acc + (asset.sharesOwned * (asset.nativeCurrency === 'USD' ? asset.realTimePrice : asset.realTimePrice / 16.5));
            }, 0);
            
            const totalMXN = totalUSD * 16.5;
            const displayValue = currency === 'USD' ? totalUSD : totalMXN;
            const uniqueTypes = [...new Set(client.portfolio.map(a => a.type))];

            return (
              <div key={client.id} className="glass-card group relative p-5 md:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors duration-300 line-clamp-1">{client.name}</h3>
                    <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 font-medium">
                      <Users className="w-3 h-3 text-primary" /> ID: {client.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenAssetsModal(client.id)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-6 md:mb-8">
                  <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-0.5">Patrimonio Estimado</p>
                  <p className="text-xl md:text-2xl font-bold tabular-nums text-white group-hover:text-primary transition-colors">{formatValue(displayValue)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                   <div className="p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Activos</p>
                      <div className="flex items-end gap-1.5">
                        <p className="text-lg md:text-xl font-bold tabular-nums leading-none">{client.portfolio.length}</p>
                        <p className="text-[8px] md:text-[9px] text-primary-glow font-bold mb-0.5 uppercase">({uniqueTypes.length})</p>
                      </div>
                   </div>
                   <div className="p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Estado</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <p className="font-bold text-[10px] uppercase tracking-wider">Activo</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2 md:gap-3">
                  <button 
                    onClick={() => handleOpenTxModal(client.id)}
                    className="flex-1 glass-button text-[10px] md:text-xs py-2.5 md:py-3 font-bold uppercase tracking-widest"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Operar
                  </button>
                  <button className="w-10 md:w-12 glass-button secondary p-0 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {filteredClients.length === 0 && (
          <div className="glass-card py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-4 mx-4 md:mx-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-300">No se encontraron clientes</h3>
              <p className="text-gray-500 max-w-[240px] md:max-w-xs text-xs mt-1 px-4">Refina los términos de búsqueda o revisa los filtros aplicados.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isTxModalOpen && selectedClientId && (
        <SmartTransactionModal 
          isOpen={isTxModalOpen} 
          onClose={() => setIsTxModalOpen(false)} 
          clientId={selectedClientId}
          clientName={allClients.find(c => c.id === selectedClientId)?.name || ''}
        />
      )}

      {isAssetsModalOpen && selectedClientId && (
        <AssetBreakdownModal 
          clientId={selectedClientId}
          clientName={allClients.find(c => c.id === selectedClientId)?.name || ''}
          portfolio={allClients.find(c => c.id === selectedClientId)?.portfolio || []}
          onClose={() => setIsAssetsModalOpen(false)}
        />
      )}

      {showAddClientInfo && (
        <div className="modal-overlay">
          <div className="glass-card w-full max-w-md p-6 md:p-8 space-y-6 mx-auto animate-fade-in">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Info className="w-6 h-6" />
              <h2 className="text-xl font-bold">Registro de Clientes</h2>
            </div>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              El registro oficial se realiza manualmente en Google Sheets tras recibir la solicitud vía WhatsApp.
            </p>
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Procedimiento:</p>
              <ul className="text-[11px] text-gray-400 space-y-3 list-decimal list-inside">
                <li>Recibe la <span className="text-white">solicitud vía WhatsApp</span> con el perfil económico.</li>
                <li>Abre tu hoja de <span className="text-white">Google Sheets</span> (Pestaña OPERACIONES).</li>
                <li>Agrega una nueva fila con el <span className="text-white">ID de cliente</span> y su primera operación.</li>
                <li>La App sincronizará al nuevo usuario al instante.</li>
              </ul>
            </div>
            <button onClick={() => setShowAddClientInfo(false)} className="glass-button w-full py-3">Entendido</button>
          </div>
        </div>
      )}
    </div>
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

  return (
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
    </div>
  );
};

export default Admin;
