import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Users, Search, Plus, Filter, ArrowUpRight, BarChart3, AlertCircle } from 'lucide-react';
import SmartTransactionModal from '../components/SmartTransactionModal.tsx';

const Admin: React.FC = () => {
  const { allClients } = usePortfolio();
  const { formatValue, currency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = allClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && c.role === 'client'
  );

  const handleOpenModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 mt-10 space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consola de Administración</h1>
            <p className="text-gray-400 mt-1">Supervisión de carteras y gestión de operaciones globales.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="glass-input pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            </div>
            <button className="glass-button secondary flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const totalUSD = client.portfolio.reduce((acc, asset) => {
                return acc + (asset.sharesOwned * (asset.nativeCurrency === 'USD' ? asset.realTimePrice : asset.realTimePrice / 16.5));
            }, 0);
            
            const totalMXN = totalUSD * 16.5;
            const displayValue = currency === 'USD' ? totalUSD : totalMXN;

            return (
              <div key={client.id} className="glass-card group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> ID: {client.id}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-blue/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary-blue" />
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-xs text-gray-500 font-medium">Patrimonio Total Estimado</p>
                  <p className="text-2xl font-bold tabular-nums text-gradient">{formatValue(displayValue)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-400 mb-1">Activos</p>
                      <p className="font-bold">{client.portfolio.length}</p>
                   </div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-400 mb-1">Riesgo</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <p className="font-bold text-xs uppercase">Bajo</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(client.id)}
                    className="flex-1 glass-button py-2.5 text-xs flex items-center justify-center gap-2 group/btn"
                  >
                    <Plus className="w-3.5 h-3.5" /> Operación
                  </button>
                  <button className="w-11 glass-button secondary py-2.5 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {filteredClients.length === 0 && (
          <div className="glass-card py-24 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No se encontraron clientes</h3>
            <p className="text-gray-500 max-w-xs text-sm mt-2">Prueba ajustando los términos de búsqueda o filtros.</p>
          </div>
        )}
      </main>

      {isModalOpen && selectedClientId && (
        <SmartTransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          clientId={selectedClientId}
          clientName={allClients.find(c => c.id === selectedClientId)?.name || ''}
        />
      )}
    </div>
  );
};

export default Admin;
