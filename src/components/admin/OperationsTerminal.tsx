import React, { useState } from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Users, Banknote, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import SmartTransactionModal from '../SmartTransactionModal';
import { submitOperation } from '../../services/sheetsService';
import toast from 'react-hot-toast';

const OperationsTerminal: React.FC = () => {
  const { allClients } = usePortfolio();
  
  // Individual Ops State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Batch Dividends State
  const [dividendForm, setDividendForm] = useState({
    ticker: '',
    dividendPerShare: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const clients = allClients.filter(c => c.role === 'client');

  const handleOpenIndividual = () => {
    if (!selectedClientId) {
      toast.error('Selecciona un cliente primero');
      return;
    }
    setIsTxModalOpen(true);
  };

  const selectedClientName = clients.find(c => c.id === selectedClientId)?.name || '';

  const handleBatchDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dividendForm.ticker || !dividendForm.dividendPerShare || !dividendForm.date) {
      toast.error('Por favor completa todos los campos del dividendo');
      return;
    }

    const dps = parseFloat(dividendForm.dividendPerShare);
    if (isNaN(dps) || dps <= 0) {
      toast.error('El dividendo por acción debe ser un número positivo');
      return;
    }

    setIsProcessing(true);

    // Find eligible clients
    const eligibleClients = clients.filter(client => 
      client.portfolio.some(asset => asset.ticker.toUpperCase() === dividendForm.ticker.toUpperCase() && asset.sharesOwned > 0)
    );

    if (eligibleClients.length === 0) {
      toast.error(`Ningún cliente tiene posiciones en ${dividendForm.ticker.toUpperCase()}`);
      setIsProcessing(false);
      return;
    }

    let successCount = 0;
    
    // We could optimize this with Promise.all, but simple iteration is fine for now
    for (const client of eligibleClients) {
      const asset = client.portfolio.find(a => a.ticker.toUpperCase() === dividendForm.ticker.toUpperCase());
      if (asset) {
        const totalDividend = asset.sharesOwned * dps;
        const success = await submitOperation({
          clientId: client.id,
          type: 'Dividendo', // Type
          assetType: asset.type,
          ticker: asset.ticker,
          shares: asset.sharesOwned,
          price: dps, // Using price field for DPS
          commission: 0,
          originalCurrency: asset.nativeCurrency,
          date: dividendForm.date,
          thesis: `Distribución automática de dividendos en lote. Total: $${totalDividend.toFixed(2)}`
        });

        if (success) successCount++;
      }
    }

    if (successCount === eligibleClients.length) {
      toast.success(`Distribuidos con éxito a ${successCount} clientes.`);
      setDividendForm({ ticker: '', dividendPerShare: '', date: new Date().toISOString().split('T')[0] });
    } else {
      toast.error(`Procesado con errores. Éxito en ${successCount}/${eligibleClients.length}.`);
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Operación Individual */}
        <div className="glass-card p-6 md:p-8 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Operación Individual</h2>
              <p className="text-xs text-gray-400">Ejecutar órdenes específicas por cliente</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Seleccionar Cliente</label>
              <select 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)}
                className="glass-input w-full text-sm py-3 px-4 appearance-none"
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleOpenIndividual}
              className="glass-button w-full py-3 mt-4"
            >
              Abrir Terminal de Transacciones
            </button>
          </div>
        </div>

        {/* Lote de Dividendos */}
        <div className="glass-card p-6 md:p-8 bg-[#0B0B0B]/40 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Distribución en Lote</h2>
              <p className="text-xs text-gray-400">Automatizar abono de dividendos</p>
            </div>
          </div>

          <form onSubmit={handleBatchDividend} className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Símbolo (Ticker)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. OXY"
                  value={dividendForm.ticker}
                  onChange={e => setDividendForm({...dividendForm, ticker: e.target.value})}
                  className="glass-input w-full text-sm py-2 px-3 uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Div. por Acción (USD/MXN)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    step="0.0001"
                    required
                    placeholder="0.00"
                    value={dividendForm.dividendPerShare}
                    onChange={e => setDividendForm({...dividendForm, dividendPerShare: e.target.value})}
                    className="glass-input w-full pl-9 text-sm py-2 px-3"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Fecha de Pago</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  required
                  value={dividendForm.date}
                  onChange={e => setDividendForm({...dividendForm, date: e.target.value})}
                  className="glass-input w-full pl-9 text-sm py-2 px-3 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-emerald/20 hover:bg-emerald/30 text-emerald border border-emerald/30 rounded-xl py-3 text-sm font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald"></span>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Ejecutar Lote</>
              )}
            </button>
          </form>
        </div>

      </div>

      {isTxModalOpen && selectedClientId && (
        <SmartTransactionModal 
          isOpen={isTxModalOpen} 
          onClose={() => setIsTxModalOpen(false)} 
          clientId={selectedClientId}
          clientName={selectedClientName}
        />
      )}
    </div>
  );
};

export default OperationsTerminal;
