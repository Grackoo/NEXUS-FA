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
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary/20 border border-primary/40 text-primary shadow-[0_0_20px_rgba(26,92,255,0.4)] backdrop-blur-md transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm h-[600px] max-h-[80vh] flex flex-col overflow-hidden glass-card bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_15px_rgba(26,92,255,0.5)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Nexus AI <Sparkles className="w-3 h-3 text-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-primary font-medium tracking-widest uppercase">Analista Experto</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-black/20">
              {messages.length === 0 && (
                <div className="text-center space-y-4 my-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">¿En qué puedo ayudarte hoy?</p>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-[250px] mx-auto">
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
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm shadow-[0_0_15px_rgba(26,92,255,0.3)]'
                        : 'bg-slate-800 border border-white/20 text-gray-100 rounded-tl-sm shadow-md'
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
                  <div className="max-w-[85%] p-4 rounded-2xl bg-slate-800 border border-white/20 text-gray-100 rounded-tl-sm shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
                    <span className="text-xs text-primary-glow font-medium ml-2">Analizando datos...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Warning Banner */}
            <div className="px-4 py-2 bg-rose-500/5 border-t border-rose-500/10 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-400 leading-tight">
                Mis sugerencias son <span className="text-white/80 font-medium">estrictamente educativas</span> y no constituyen asesoría financiera, legal o fiscal.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-slate-900 rounded-b-2xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu consulta aquí..."
                  className="w-full bg-slate-800 border-2 border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-md"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  <Send className="w-5 h-5" />
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
