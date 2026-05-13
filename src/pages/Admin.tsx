import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { usePortfolio } from '../contexts/PortfolioContext';
import { Shield, PlusCircle, Info, Search, BarChart3, Users, Terminal } from 'lucide-react';
import NexusLoadingScreen from '../components/NexusLoadingScreen';
import GlobalOverview from '../components/admin/GlobalOverview';
import ClientDirectory from '../components/admin/ClientDirectory';
import OperationsTerminal from '../components/admin/OperationsTerminal';
import AuditLog from '../components/admin/AuditLog';
import BillingEngine from '../components/admin/BillingEngine';

const Admin: React.FC = () => {
  const { isLoading } = usePortfolio();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'directory' | 'terminal' | 'audit' | 'billing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClientInfo, setShowAddClientInfo] = useState(false);

  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    return !sessionStorage.getItem('hasSeenAdminLoading');
  });

  if (showLoadingScreen) {
    return (
      <NexusLoadingScreen 
        onComplete={() => {
          sessionStorage.setItem('hasSeenAdminLoading', 'true');
          setShowLoadingScreen(false);
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sincronizando Carteras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-10 space-y-6 md:space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
               <Shield className="w-4 h-4" /> Management Console
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">Centro de Comando</h1>
            <p className="text-gray-400 text-xs md:text-sm max-w-lg">Sistema CRM Financiero Avanzado (God View).</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {activeTab === 'directory' && (
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
            )}
            <button 
              onClick={() => setShowAddClientInfo(true)}
              className="glass-button flex items-center justify-center gap-2 px-4 py-2.5 text-xs whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>
        </header>

        {/* Custom Tabs Navigation (Dark/Neon) */}
        <div className="flex space-x-1 border-b border-white/10 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'overview' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Visión Global
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'directory' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" /> Directorio de Clientes
            {activeTab === 'directory' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'terminal' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Terminal className="w-4 h-4" /> Terminal de Operaciones
            {activeTab === 'terminal' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'audit' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Shield className="w-4 h-4" /> Audit Log
            {activeTab === 'audit' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'billing' 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Comisiones
            {activeTab === 'billing' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="pt-4">
          {activeTab === 'overview' && <GlobalOverview />}
          {activeTab === 'directory' && <ClientDirectory searchTerm={searchTerm} />}
          {activeTab === 'terminal' && <OperationsTerminal />}
          {activeTab === 'audit' && <AuditLog />}
          {activeTab === 'billing' && <BillingEngine />}
        </div>
      </main>

      {/* Info Modal */}
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

export default Admin;
