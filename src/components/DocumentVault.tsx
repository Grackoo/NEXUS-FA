import React from 'react';
import { FileText, Download, Shield } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  date: string;
  url: string;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Estado de Cuenta - Abril 2026', date: '2026-05-01', url: '#' },
  { id: '2', name: 'Estado de Cuenta - Marzo 2026', date: '2026-04-01', url: '#' },
  { id: '3', name: 'Reporte de Rendimientos Anual 2025', date: '2026-01-15', url: '#' },
  { id: '4', name: 'Contrato de Gestión Patrimonial', date: '2025-06-10', url: '#' },
];

export const DocumentVault: React.FC = () => {
  return (
    <div className="glass-card p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Bóveda de Documentos</h2>
          <p className="text-xs text-gray-400">Reportes y estados de cuenta encriptados</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{doc.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(doc.date).toLocaleDateString()}</p>
              </div>
            </div>
            <a 
              href={doc.url}
              download
              className="p-2 rounded-lg hover:bg-primary/20 text-gray-400 hover:text-primary transition-all border border-transparent hover:border-primary/30"
              title="Descargar documento"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentVault;
