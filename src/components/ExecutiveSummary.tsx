import React from 'react';
import { Sparkles, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ExecutiveSummary: React.FC = () => {
  const { user } = useAuth();
  
  // In a real app, this would be fetched from the database based on the client.
  // For now, we'll mock a generic professional note.
  const advisorNote = `Estimado ${user?.name || 'Cliente'}, el portafolio mantiene una fuerte exposición en tecnología y liquidez en moneda fuerte. Sugerimos mantener la posición en renta fija (CETES) para aprovechar las altas tasas actuales mientras evaluamos reentradas escalonadas en Renta Variable tras el próximo reporte de inflación.`;

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl h-full shadow-2xl flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Resumen Ejecutivo</h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary/80">Nota del Asesor</p>
        </div>
      </div>

      <div className="flex-1 relative mt-2">
        <MessageSquareQuote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
        <p className="text-sm text-gray-300 leading-relaxed pl-4 border-l-2 border-primary/30 py-1">
          {advisorNote}
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 text-[9px] font-bold text-primary">
            NA
          </div>
          <span className="text-xs text-gray-400">Nexus Advisor</span>
        </div>
        <span className="text-[10px] text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
