import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Users, Search, Plus, Filter, ArrowUpRight, BarChart3, AlertCircle, Shield, Eye, Pencil, Check, X, PlusCircle, Info } from 'lucide-react';
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

      <main className="max-w-7xl mx-auto px-8 mt-10 space-y-10 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
               <Shield className="w-4 h-4" /> Management Console
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient">Administración Global</h1>
            <p className="text-gray-400 text-sm max-w-lg">Supervisión integral de carteras, gestión de riesgos y ejecución de operaciones estratégicas para el fondo.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar por nombre o ID..." 
                className="glass-input pl-11 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button 
              onClick={() => setShowAddClientInfo(true)}
              className="glass-button flex items-center gap-2 px-4 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map(client => {
            const totalUSD = client.portfolio.reduce((acc, asset) => {
                return acc + (asset.sharesOwned * (asset.nativeCurrency === 'USD' ? asset.realTimePrice : asset.realTimePrice / 16.5));
            }, 0);
            
            const totalMXN = totalUSD * 16.5;
            const displayValue = currency === 'USD' ? totalUSD : totalMXN;
            const uniqueTypes = [...new Set(client.portfolio.map(a => a.type))];

            return (
              <div key={client.id} className="glass-card group relative p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">{client.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-1.5 font-medium">
                      <Users className="w-3 h-3" /> ID: {client.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenAssetsModal(client.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all"
                      title="Ver Desglose de Activos"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Patrimonio Estimado</p>
                  <p className="text-2xl font-bold tabular-nums text-white group-hover:text-primary transition-colors">{formatValue(displayValue)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                      <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Activos</p>
                      <div className="flex items-end gap-2">
                        <p className="text-xl font-bold tabular-nums leading-none">{client.portfolio.length}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">({uniqueTypes.length} clases)</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                      <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Estado</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <p className="font-bold text-xs uppercase tracking-wider">Activo</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleOpenTxModal(client.id)}
                    className="flex-1 glass-button text-xs py-3 font-bold group/btn"
                  >
                    <Plus className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-90 transition-transform" /> 
                    NUEVA OPERACIÓN
                  </button>
                  <button className="w-12 glass-button secondary p-0 flex items-center justify-center group/arrow">
                    <ArrowUpRight className="w-5 h-5 group-hover/arrow:translate-x-1 group-hover/arrow:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {filteredClients.length === 0 && (
          <div className="glass-card py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <AlertCircle className="w-10 h-10 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-300">No se encontraron resultados</h3>
              <p className="text-gray-500 max-w-xs text-sm mt-1">Refina los términos de búsqueda o revisa los filtros aplicados.</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Info className="w-6 h-6" />
              <h2 className="text-xl font-bold">Cómo registrar un nuevo cliente</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Para garantizar la seguridad y el control del fondo, el registro de nuevos clientes se realiza manualmente en tu base de datos de Google Sheets.
            </p>
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Pasos a seguir:</p>
              <ul className="text-xs text-gray-400 space-y-3 list-decimal list-inside">
                <li>Recibe la solicitud via WhatsApp (con los datos captados).</li>
                <li>Abre tu hoja de <span className="text-white">Google Sheets</span>.</li>
                <li>Ve a la pestaña de <span className="text-white">OPERACIONES</span>.</li>
                <li>Registra la primera compra o depósito asignando un nuevo <span className="text-white">ID</span> de cliente.</li>
                <li>La App reconocerá al nuevo cliente automáticamente en el próximo inicio de sesión.</li>
              </ul>
            </div>
            <button onClick={() => setShowAddClientInfo(false)} className="glass-button w-full">Entendido</button>
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
    // Send as an 'Adjustment' type operation
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
      // In a real app we would refresh global state here
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-3xl p-0 overflow-hidden shadow-2xl border-white/10">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Desglose: {clientName}
              </h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Resumen Detallado de Activos</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-0 overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0B0B0B] z-10">
              <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="px-8 py-4">Ticker</th>
                <th className="px-4 py-4">Clase</th>
                <th className="px-4 py-4 text-right">Cant. Actual</th>
                <th className="px-4 py-4 text-right">Costo Prom (USD)</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {portfolio.map(asset => (
                <tr key={asset.ticker} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 font-bold text-sm text-primary">{asset.ticker}</td>
                  <td className="px-4 py-4 text-xs text-gray-400">{asset.type}</td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    {editingTicker === asset.ticker ? (
                      <input 
                        type="number" 
                        value={editData.shares} 
                        onChange={e => setEditData({...editData, shares: Number(e.target.value)})}
                        className="glass-input w-24 text-right py-1 px-2"
                      />
                    ) : asset.sharesOwned}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    {editingTicker === asset.ticker ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-gray-500">$</span>
                        <input 
                          type="number" 
                          value={editData.price} 
                          onChange={e => setEditData({...editData, price: Number(e.target.value)})}
                          className="glass-input w-24 text-right py-1 px-2"
                        />
                      </div>
                    ) : `$${asset.avgPurchasePriceUSD.toFixed(2)}`}
                  </td>
                  <td className="px-8 py-4 text-center">
                    {editingTicker === asset.ticker ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          disabled={isSubmitting}
                          onClick={() => saveEdit(asset)} 
                          className="p-1.5 bg-emerald/20 text-emerald rounded-lg hover:bg-emerald/30"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingTicker(null)} 
                          className="p-1.5 bg-crimson/20 text-crimson rounded-lg hover:bg-crimson/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEdit(asset)}
                        className="p-1.5 bg-white/5 text-gray-400 rounded-lg hover:text-primary hover:bg-white/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
              Las ediciones generan una operación de <span className="text-white">Ajuste</span>. Los cambios impactarán visualmente en el próximo refresco de datos.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
