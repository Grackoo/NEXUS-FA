import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Bot, RefreshCw, Cpu } from 'lucide-react';
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
  
  const [activeTab, setActiveTab] = useState<'ai' | 'advisor'>('ai');
  const [aiNote, setAiNote] = useState<ExecutiveAINote | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Cargar nota inicial de la IA
  useEffect(() => {
    if (user?.id) {
      const saved = getExecutiveAINote(user.id);
      if (saved) {
        setAiNote(saved);
      } else {
        // Nota por defecto si aún no se ha generado una
        setAiNote({
          note: `Análisis inicial de portafolio para ${user.name}: Las posiciones actuales muestran solidez en renta variable y liquidez defensiva. Tras cada operación de compra registrada, Nexus AI evaluará automáticamente el impacto en ponderación, riesgo y niveles clave en este panel.`,
          updatedAt: new Date().toISOString(),
          triggerType: 'initial',
          modelUsed: 'Gemini 2.0 Flash',
        });
      }
    }

    const handleNoteUpdated = (e: any) => {
      if (e?.detail) {
        setAiNote(e.detail);
        setActiveTab('ai'); // Dar protagonismo a la actualización de IA tras una compra
      }
    };

    window.addEventListener('nexus_ai_note_updated', handleNoteUpdated);
    return () => window.removeEventListener('nexus_ai_note_updated', handleNoteUpdated);
  }, [user?.id, user?.name]);

  const handleManualAIRefresh = async () => {
    if (!user) return;
    setIsGeneratingAI(true);
    try {
      const portfolioSummary = clientPortfolio
        .map(a => `- ${a.ticker} (${a.type}): ${a.sharesOwned} títulos @ ${a.avgPurchasePriceUSD ? `$${a.avgPurchasePriceUSD} USD` : `$${a.avgPurchasePriceMXN} MXN`}`)
        .join('\n');

      const updated = await generateGeneralPortfolioAINote(
        user.id,
        user.name,
        portfolioSummary,
        user.riskProfile
      );
      setAiNote(updated);
      toast.success('Nota ejecutiva de Nexus AI actualizada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'No se pudo actualizar la nota de IA');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clientNoteData = user ? getNote(user.id) : null;
  const isCustomAdvisorNote = !!clientNoteData?.note;
  
  const advisorNote = isCustomAdvisorNote 
    ? clientNoteData.note 
    : `Estimado ${user?.name || 'Cliente'}, el portafolio mantiene una prudente diversificación en tecnología y liquidez en moneda fuerte. Sugerimos mantener la posición en renta fija (CETES) para capitalizar tasas mientras evaluamos reentradas escalonadas en Renta Variable tras el próximo reporte macroeconómico.`;

  const needsToRead = isCustomAdvisorNote && !clientNoteData.isRead;

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-[#0c1427]/90 via-[#070b14]/90 to-black/90 border border-primary/25 rounded-3xl h-full shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-primary/15 blur-[60px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />

      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-600/10 border border-primary/40 text-primary shadow-[0_0_15px_rgba(26,92,255,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Resumen Ejecutivo
            </h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary/80">
              Estrategia & Asesoría
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,92,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agente IA</span>
            {aiNote?.triggerType === 'buy' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'advisor'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Asesor Humano</span>
            {needsToRead && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide relative z-10 pr-1">
        {activeTab === 'ai' ? (
          /* ── NOTA DEL AGENTE IA ── */
          <div className="space-y-3 animate-fade-in flex flex-col h-full justify-between">
            <div>
              {/* Badge Context */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <Cpu className="w-3 h-3" />
                  <span>
                    {aiNote?.triggerType === 'buy' && aiNote.ticker
                      ? `Actualizado tras compra: ${aiNote.ticker}`
                      : 'Análisis Estratégico en Vivo'}
                  </span>
                </div>

                <button
                  onClick={handleManualAIRefresh}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                  title="Actualizar análisis con Nexus AI"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin text-primary' : ''}`} />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
              </div>

              {/* Note Content */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-normal">
                  {aiNote?.note}
                </p>
              </div>

              {aiNote?.triggerType === 'buy' && aiNote.price && (
                <div className="mt-2.5 flex items-center gap-3 text-[10px] text-gray-400 px-1">
                  <span>Última orden: <strong className="text-white">+{aiNote.shares} {aiNote.ticker}</strong></span>
                  <span>•</span>
                  <span>Ejecución: <strong className="text-white">${aiNote.price} {aiNote.currency}</strong></span>
                </div>
              )}
            </div>

            {/* AI Footer info */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 mt-2">
              <span className="flex items-center gap-1 text-primary-glow font-medium">
                <Sparkles className="w-3 h-3 text-primary" />
                Motor: {aiNote?.modelUsed || 'Gemini 2.0 Flash'}
              </span>
              <span>
                {aiNote?.updatedAt 
                  ? new Date(aiNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
                  : new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        ) : (
          /* ── NOTA DEL ASESOR HUMANO ── */
          <div className="space-y-4 animate-fade-in flex flex-col h-full justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {advisorNote}
                </p>
              </div>

              {needsToRead && (
                <div className="mt-3">
                  <button 
                    onClick={() => user && markAsRead(user.id)}
                    className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(26,92,255,0.2)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Leído
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 text-[9px] font-bold text-primary">
                  NA
                </div>
                <span className="text-gray-400 font-medium">Asesor Patrimonial</span>
              </div>
              <div className="flex items-center gap-2">
                {clientNoteData?.isRead && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Visto
                  </span>
                )}
                <span>
                  {clientNoteData?.updatedAt ? new Date(clientNoteData.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
