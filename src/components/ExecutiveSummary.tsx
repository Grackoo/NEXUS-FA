import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Bot, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdvisorNotes } from '../hooks/useAdvisorNotes';
import { usePortfolio } from '../contexts/PortfolioContext';
import { 
  getExecutiveAINote, 
  generateGeneralPortfolioAINote, 
  type ExecutiveAINote 
} from '../services/aiAdvisorService';
import toast from 'react-hot-toast';

export const ExecutiveSummary: React.FC = () => {
  const { user } = useAuth();
  const { clientPortfolio } = usePortfolio();
  const { getNote, markAsRead } = useAdvisorNotes();
  
  const [aiNote, setAiNote] = useState<ExecutiveAINote | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const saved = getExecutiveAINote(user.id);
      if (saved) {
        setAiNote(saved);
      } else {
        setAiNote({
          note: `Análisis inicial: Las posiciones mantienen equilibrio entre renta variable y liquidez. Tras cada compra, este reporte integrará de forma automática el impacto táctico en tu portafolio.`,
          updatedAt: new Date().toISOString(),
          triggerType: 'initial',
          modelUsed: 'Gemini 2.0 Flash',
        });
      }
    }

    const handleNoteUpdated = (e: any) => {
      if (e?.detail) {
        setAiNote(e.detail);
      }
    };

    window.addEventListener('nexus_ai_note_updated', handleNoteUpdated);
    return () => window.removeEventListener('nexus_ai_note_updated', handleNoteUpdated);
  }, [user?.id]);

  const handleManualAIRefresh = async () => {
    if (!user) return;
    setIsGeneratingAI(true);
    try {
      const portfolioSummary = clientPortfolio
        .map(a => `- ${a.ticker} (${a.type}): ${a.sharesOwned} títulos`)
        .join('\n');

      const updated = await generateGeneralPortfolioAINote(
        user.id,
        user.name,
        portfolioSummary,
        user.riskProfile
      );
      setAiNote(updated);
      toast.success('Nota de Nexus AI actualizada');
    } catch (err: any) {
      toast.error(err.message || 'No se pudo actualizar la nota');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clientNoteData = user ? getNote(user.id) : null;
  const isCustomNote = !!clientNoteData?.note;
  
  const advisorNote = isCustomNote 
    ? clientNoteData.note 
    : `Estimado ${user?.name || 'Cliente'}, el portafolio mantiene una fuerte exposición en tecnología y liquidez en moneda fuerte. Sugerimos mantener la posición en renta fija (CETES) para aprovechar las altas tasas actuales mientras evaluamos reentradas escalonadas en Renta Variable tras el próximo reporte de inflación.`;

  const needsToRead = isCustomNote && !clientNoteData.isRead;

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl h-full shadow-2xl flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Header Original */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Resumen Ejecutivo</h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary/80">Nota del Asesor</p>
          </div>
        </div>
      </div>

      {/* Contenido con scroll dentro de la altura de la tarjeta */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 space-y-4 pr-1">
        {/* Nota del Asesor */}
        <div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {advisorNote}
          </p>

          {needsToRead && (
            <div className="mt-3">
              <button 
                onClick={() => user && markAsRead(user.id)}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(26,92,255,0.2)]"
              >
                <CheckCircle2 className="w-4 h-4" /> Marcar como Leído
              </button>
            </div>
          )}
        </div>

        {/* ── Mensaje Abajo: Nota del Agente IA ── */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  Nota del Agente IA (Nexus AI)
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[9px] text-emerald-400/90 font-medium">
                  {aiNote?.triggerType === 'buy' && aiNote.ticker
                    ? `Actualizado tras compra: ${aiNote.ticker}`
                    : 'Estrategia Táctica en Vivo'}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualAIRefresh}
              disabled={isGeneratingAI}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Actualizar análisis de IA"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
              {aiNote?.note}
            </p>
            {aiNote?.triggerType === 'buy' && aiNote.price && (
              <p className="text-[10px] text-gray-400 mt-2 font-medium">
                Última orden: <strong className="text-white">+{aiNote.shares} {aiNote.ticker}</strong> a <strong className="text-white">${aiNote.price} {aiNote.currency}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1.5 px-1">
            <span>Motor: {aiNote?.modelUsed || 'Gemini 2.0 Flash'}</span>
            <span>{aiNote?.updatedAt ? new Date(aiNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        </div>
      </div>
      
      {/* Footer Original */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between shrink-0">
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
