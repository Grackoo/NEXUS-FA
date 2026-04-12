import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Users, Search, Plus, Filter, ArrowUpRight, BarChart3, AlertCircle, Shield } from 'lucide-react';
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
                className="glass-input pl-11 w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button className="glass-button secondary p-3">
              <Filter className="w-5 h-5" />
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
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(26,92,255,0.3)] transition-all">
                    <BarChart3 className="w-5 h-5" />
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
                    onClick={() => handleOpenModal(client.id)}
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
