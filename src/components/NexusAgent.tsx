import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
}

const NexusAgent: React.FC = () => {
  const { user } = useAuth();
  const { clientPortfolio } = usePortfolio();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Si no hay usuario, no mostramos el agente
  if (!user) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: userText }],
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Resumen estructurado del portafolio
      const portfolioSummary = clientPortfolio
        .map(asset => `- ${asset.ticker} (${asset.type}): ${asset.sharesOwned} acciones, Promedio: ${asset.avgPurchasePriceUSD ? `$${asset.avgPurchasePriceUSD} USD` : `$${asset.avgPurchasePriceMXN} MXN`}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(({ role, parts }) => ({ role, parts })), // Mapear solo los datos que espera la API
          riskProfile: user.riskProfile,
          portfolioSummary,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Error al conectar con Nexus AI';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {
          console.error('No se pudo parsear el error:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: data.text }],
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error desconocido al conectar con Nexus AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary/20 border border-primary/40 text-primary shadow-[0_0_20px_rgba(26,92,255,0.4)] backdrop-blur-xl transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* Ventana de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[650px] max-h-[85vh] flex flex-col overflow-hidden bg-[#0A0E17]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_20px_rgba(26,92,255,0.15)] rounded-[24px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent relative overflow-hidden shrink-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_20px_rgba(26,92,255,0.4)]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5 tracking-tight">
                    Nexus AI <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-primary/80 font-bold tracking-[0.2em] uppercase">Analista Experto</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide relative bg-black/10">
              {messages.length === 0 && (
                <div className="text-center space-y-4 my-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">¿En qué puedo ayudarte hoy?</p>
                    <p className="text-[11px] text-gray-500 mt-2 max-w-[250px] mx-auto leading-relaxed">
                      Pregúntame sobre tu portafolio, análisis de activos o impacto de noticias.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-sm shadow-[0_10px_20px_rgba(26,92,255,0.2)]'
                        : 'bg-white/[0.04] border border-white/5 text-gray-200 rounded-tl-sm shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
                    }`}
                  >
                    {msg.role === 'user' 
                      ? msg.parts[0].text 
                      : msg.parts[0].text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{chunk}</strong> : chunk)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] p-4 rounded-2xl bg-white/[0.04] border border-white/5 text-gray-200 rounded-tl-sm shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75 shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150 shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="text-xs text-primary-glow font-medium ml-2">Analizando datos...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Warning Banner */}
            <div className="px-5 py-3 bg-rose-500/5 border-t border-rose-500/10 flex items-start gap-2 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-tight">
                Mis sugerencias son <span className="text-white/80 font-medium">estrictamente educativas</span> y no constituyen asesoría financiera, legal o fiscal.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 pt-2 pb-5 border-t border-white/5 bg-black/20 shrink-0">
              <div className="relative flex items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder="Escribe tu consulta aquí..."
                  rows={1}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-4 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all resize-none scrollbar-hide shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] block"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-1.5 p-2 rounded-xl bg-primary text-white hover:bg-blue-600 disabled:opacity-30 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-[0_0_15px_rgba(26,92,255,0.4)] disabled:shadow-none flex items-center justify-center shrink-0"
                  style={{ height: '36px', width: '36px' }}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NexusAgent;
