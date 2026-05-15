import React, { useState, useEffect } from 'react';
import { FileText, Download, Shield, Calendar, BarChart3, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { prepareReportData } from '../services/reportService';
import ClientReportModal from './admin/ClientReportModal';
import toast from 'react-hot-toast';

export const DocumentVault: React.FC = () => {
  const { user } = useAuth();
  const { clientPortfolio, clientOperations } = usePortfolio();
  const { exchangeRate } = useCurrency();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  const [contractUrl, setContractUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedContractUrl = localStorage.getItem(`contractUrl_${user.id}`);
      if (savedContractUrl) {
        setContractUrl(savedContractUrl);
      }
    }
  }, [user]);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast.error('Por favor selecciona una fecha de inicio y fin.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    const filteredOps = clientOperations.filter(op => {
      const opDate = new Date(op.date);
      return opDate >= start && opDate <= end;
    });

    if (filteredOps.length === 0) {
      toast.error('No hay operaciones en este rango de fechas.');
      return;
    }

    // Calcula el total del portafolio actual (o podrías hacer una simulación del portafolio en esa fecha si fuera complejo, pero para la demostración usamos el actual)
    let totalUSD = 0;
    let totalMXN = 0;
    
    clientPortfolio.forEach(asset => {
      const isUSD = asset.nativeCurrency === 'USD';
      const priceUSD = isUSD ? asset.realTimePrice : asset.realTimePrice / exchangeRate;
      const priceMXN = isUSD ? asset.realTimePrice * exchangeRate : asset.realTimePrice;
      
      totalUSD += asset.sharesOwned * priceUSD;
      totalMXN += asset.sharesOwned * priceMXN;
    });

    const reportData = prepareReportData(
      { id: user?.id || '', name: user?.name || '', role: 'client', portfolio: clientPortfolio, operations: filteredOps },
      filteredOps,
      totalUSD,
      totalMXN,
      exchangeRate
    );
    
    // Sobrescribir las operaciones para mostrar solo las filtradas (sin límite de 10 si se desea, o mantenemos la función)
    if (reportData) {
      reportData.reportDate = `Reporte del ${start.toLocaleDateString()} al ${end.toLocaleDateString()}`;
    }

    setGeneratedReport(reportData);
    toast.success('Reporte generado exitosamente.');
  };

  return (
    <div className="glass-card p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Bóveda de Documentos</h2>
          <p className="text-xs text-gray-400">Reportes personalizados y contratos</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Generador de Reportes */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Generador de Reportes
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Fecha Inicio</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input w-full text-sm pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Fecha Fin</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input w-full text-sm pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <button 
                onClick={handleGenerateReport}
                className="glass-button w-full py-2.5 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
              >
                <FileText className="w-4 h-4" /> Generar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Contrato */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" /> Contrato de Gestión
          </h3>
          {contractUrl ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Contrato Firmado</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Documento Oficial</p>
                </div>
              </div>
              <a 
                href={contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-transparent hover:border-primary/30 flex items-center gap-2 text-xs font-bold"
                title="Ver contrato"
              >
                Ver PDF <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-sm text-gray-500">
              No hay ningún contrato vinculado actualmente. El administrador debe subirlo.
            </div>
          )}
        </div>
      </div>

      {generatedReport && (
        <ClientReportModal 
          reportData={generatedReport}
          onClose={() => setGeneratedReport(null)}
        />
      )}
    </div>
  );
};

export default DocumentVault;
