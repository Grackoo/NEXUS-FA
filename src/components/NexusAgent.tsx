import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, AlertTriangle, Sparkles, Cpu, RotateCcw, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  modelUsed?: string;
  timestamp?: string;
}

const GEMINI_MODELS = [
  { id: 'auto', name: 'Auto (Respaldo inteligente)', badge: 'Recomendado', desc: 'Conmuta automáticamente si hay saturación' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Alta velocidad', desc: 'Modelo insignia para análisis de mercado' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', badge: 'Ultra ligero', desc: 'Bajo consumo para momentos de tráfico alto' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Nueva generación', desc: 'Mayor agudeza y contexto extendido' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Respaldo', desc: 'Modelo probado de alta disponibilidad' },
];

const SUGGESTED_PROMPTS = [
  '¿Cuál es el impacto de mi última compra en mi portafolio?',
  'Analiza la diversificación actual entre CETES, Renta Variable y Cripto.',
  '¿Qué niveles clave de soporte y toma de utilidades recomiendas hoy?',
  'Explica la estrategia adecuada según mi perfil de riesgo.',
];

const NexusAgent: React.FC = () => {
  const { user } = useAuth();
  const { clientPortfolio } = usePortfolio();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [showModelMenu, setShowModelMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fecha actual en tiempo real
  const currentDateStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!user) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || inputValue).trim();
    if (!userText || isLoading) return;

    setInputValue('');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: userText }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Resumen estructurado del portafolio actual
      const portfolioSummary = clientPortfolio.length > 0
        ? clientPortfolio
            .map(asset => `- ${asset.ticker} (${asset.type}): ${asset.sharesOwned} títulos, Precio prom: ${asset.avgPurchasePriceUSD ? `$${asset.avgPurchasePriceUSD} USD` : `$${asset.avgPurchasePriceMXN} MXN`}`)
            .join('\n')
        : 'Sin activos registrados aún en el portafolio.';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(({ role, parts }) => ({ role, parts })),
          riskProfile: user.riskProfile || 'Balanceado',
          portfolioSummary,
          preferredModel: selectedModel === 'auto' ? undefined : selectedModel,
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
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error: any) {
      console.error('Error en chat con Nexus AI:', error);
      toast.error(error.message || 'Error desconocido al conectar con Nexus AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Conversación reiniciada');
  };

  const activeModelObj = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 border border-primary/50 text-white shadow-[0_0_25px_rgba(26,92,255,0.5)] backdrop-blur-xl transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 flex items-center gap-2'}`}
      >
        <Bot className="w-6 h-6 text-primary-glow" />
        <span className="hidden md:inline text-xs font-bold text-white tracking-wider pr-1">Nexus AI</span>
      </motion.button>

      {/* Ventana de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50 w-[96vw] sm:w-[420px] h-[680px] max-h-[88vh] flex flex-col overflow-hidden bg-[#070b14]/95 backdrop-blur-2xl border border-primary/25 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(26,92,255,0.2)] rounded-[26px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/20 via-blue-900/10 to-transparent relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(26,92,255,0.5)]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 tracking-tight">
                      Nexus AI <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium capitalize">
                        <Calendar className="w-2.5 h-2.5 text-primary" /> {currentDateStr}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Reiniciar conversación"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Model Selector Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-gray-400 font-medium">Motor:</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-white hover:border-primary/40 hover:bg-white/10 transition-all"
                  >
                    <span className="text-primary font-bold">●</span>
                    <span className="truncate max-w-[170px]">{activeModelObj.name}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  {/* Dropdown de Modelos */}
                  {showModelMenu && (
                    <div className="absolute right-0 top-8 w-64 p-2 bg-[#0c1322] border border-white/15 rounded-xl shadow-2xl z-50 animate-fade-in space-y-1">
                      <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-gray-400 font-bold border-b border-white/5 mb-1">
                        Seleccionar versión de Gemini
                      </div>
                      {GEMINI_MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelMenu(false);
                            toast.success(`Modelo cambiado a ${m.name}`);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col ${
                            selectedModel === m.id
                              ? 'bg-primary/20 border border-primary/40 text-white'
                              : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{m.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-primary-glow font-medium">
                              {m.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide relative bg-black/30">
              {messages.length === 0 && (
                <div className="text-center space-y-4 my-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-[0_0_25px_rgba(26,92,255,0.3)]">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Hola, {user.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Estratega financiero con contexto en tiempo real de tu portafolio y los mercados globales.
                    </p>
                  </div>

                  {/* Sugerencias Rápidas */}
                  <div className="pt-2 text-left space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold px-1">
                      Consultas sugeridas:
                    </p>
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-primary/5 text-xs text-gray-300 hover:text-white transition-all duration-200 block truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(26,92,255,0.25)]'
                        : 'bg-white/[0.04] border border-white/10 text-gray-100 rounded-tl-sm shadow-[0_5px_15px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {msg.role === 'user' 
                      ? msg.parts[0].text 
                      : msg.parts[0].text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{chunk}</strong> : chunk)}
                  </div>

                  {/* Metadata de respuesta del modelo */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-gray-500">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="flex items-center gap-1 text-primary-glow font-medium">
                        • {msg.modelUsed}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-gray-200 rounded-tl-sm shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75 shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150 shadow-[0_0_10px_rgba(26,92,255,0.8)]" />
                    <span className="text-xs text-primary-glow font-medium ml-1">Consultando Gemini ({activeModelObj.name})...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-2 bg-rose-500/5 border-t border-rose-500/10 flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
              <p className="text-[9px] text-gray-400 leading-tight truncate">
                Fines estratégicos y educativos. No constituye asesoría financiera o legal formal.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-white/10 bg-black/40 shrink-0">
              <div className="relative flex items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Pregunta sobre activos, estrategia o mercado..."
                  rows={1}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3 pl-3.5 pr-12 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/60 focus:bg-white/[0.06] transition-all resize-none scrollbar-hide shadow-inner block"
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-1.5 bottom-1.5 p-2 rounded-xl bg-primary text-white hover:bg-blue-600 disabled:opacity-30 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-[0_0_15px_rgba(26,92,255,0.4)] disabled:shadow-none flex items-center justify-center shrink-0"
                  style={{ height: '34px', width: '34px' }}
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
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
