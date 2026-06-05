import React from 'react';
import { Sparkles, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdvisorNotes } from '../hooks/useAdvisorNotes';

export const ExecutiveSummary: React.FC = () => {
  const { user } = useAuth();
  const { getNote, markAsRead } = useAdvisorNotes();
  
  const clientNoteData = user ? getNote(user.id) : null;
  const isCustomNote = !!clientNoteData?.note;
  
  const advisorNote = isCustomNote 
    ? clientNoteData.note 
    : `Estimado ${user?.name || 'Cliente'}, el portafolio mantiene una fuerte exposición en tecnología y liquidez en moneda fuerte. Sugerimos mantener la posición en renta fija (CETES) para aprovechar las altas tasas actuales mientras evaluamos reentradas escalonadas en Renta Variable tras el próximo reporte de inflación.`;

  const needsToRead = isCustomNote && !clientNoteData.isRead;

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

      <div className="flex-1 relative mt-4 z-10">
        <MessageSquareQuote className="absolute -top-4 right-2 w-20 h-20 text-primary/5 -z-10" />
        <div className="border-l-2 border-primary/30 pl-4 py-1">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {advisorNote}
          </p>
        </div>
        
        {needsToRead && (
          <div className="mt-4 pl-4">
            <button 
              onClick={() => user && markAsRead(user.id)}
              className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(26,92,255,0.2)] hover:shadow-[0_0_20px_rgba(26,92,255,0.4)]"
            >
              <CheckCircle2 className="w-4 h-4" /> Marcar como Leído
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 text-[9px] font-bold text-primary">
            NA
          </div>
          <span className="text-xs text-gray-400">Nexus Advisor</span>
        </div>
        <div className="flex items-center gap-3">
          {clientNoteData?.isRead && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Visto
            </span>
          )}
          <span className="text-[10px] text-gray-500">
            {clientNoteData?.updatedAt ? new Date(clientNoteData.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
