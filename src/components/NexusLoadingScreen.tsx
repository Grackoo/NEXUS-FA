import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

export default function NexusLoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [simKey, setSimKey] = useState(0);

  // Mensajes dinámicos para mantener al usuario interesado
  const loadingMessages = [
    { text: "Estableciendo conexión segura...", icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
    { text: "Sincronizando cotizaciones en vivo...", icon: <Activity className="w-4 h-4 text-purple-500" /> },
    { text: "Calculando rendimiento histórico...", icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { text: "Preparando tu portafolio...", icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
  ];

  useEffect(() => {
    // Simular el progreso de 0 a 100% en 5 segundos (5000ms)
    const totalDuration = 5000;
    const intervalTime = 50; 
    const steps = totalDuration / intervalTime;
    const increment = 100 / steps;

    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setIsLoaded(true);
        if (onComplete) {
          setTimeout(onComplete, 1500);
        }
      }
      setProgress(currentProgress);
    }, intervalTime);

    // Cambiar el mensaje 4 veces
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, totalDuration / loadingMessages.length);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [simKey]);

  const handleReplay = () => {
    setIsLoaded(false);
    setProgress(0);
    setMessageIndex(0);
    setSimKey(prev => prev + 1);
  };

  // --- CONFIGURACIÓN DE LA GRÁFICA DE ACCIONES ---
  const viewBoxWidth = 240;
  const viewBoxHeight = 120;
  
  // Puntos de la gráfica (Eje X, Eje Y invertido donde 0 es arriba)
  // Simula una acción con volatilidad pero tendencia general al alza
  const points = [
    [0, 100], [24, 92], [48, 105], [72, 70], [96, 85],
    [120, 55], [144, 65], [168, 30], [192, 45], [216, 15], [240, 5]
  ];

  // Construir los paths SVG
  const linePath = `M ${points.map(p => p.join(',')).join(' L ')}`;
  const fillPath = `${linePath} L ${viewBoxWidth} ${viewBoxHeight} L 0 ${viewBoxHeight} Z`;

  // Calcular la posición exacta del punto de luz (dot) interpolando los segmentos
  const currentX = (progress / 100) * viewBoxWidth;
  let dotY = 100; // Valor inicial por defecto

  if (progress > 0) {
    let p1 = points[0];
    let p2 = points[1];
    
    // Encontrar en qué segmento de la línea estamos actualmente
    for (let i = 0; i < points.length - 1; i++) {
      if (currentX >= points[i][0] && currentX <= points[i+1][0]) {
        p1 = points[i];
        p2 = points[i+1];
        break;
      }
    }
    
    // Matemática para calcular la altura (Y) exacta en la posición X actual
    const segmentWidth = p2[0] - p1[0];
    const segmentProgress = segmentWidth === 0 ? 0 : (currentX - p1[0]) / segmentWidth;
    dotY = p1[1] + (p2[1] - p1[1]) * segmentProgress;
  }

  // Vista cuando finaliza la carga
  if (isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
             <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white">¡Bienvenido!</h2>
          <p className="text-gray-400 text-sm mt-2 mb-8">Redirigiendo a tu Dashboard...</p>
          
          <button 
            onClick={handleReplay}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-full text-sm font-semibold transition-colors border border-gray-700 shadow-lg flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Ver animación de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0e14] text-white relative overflow-hidden font-sans">
      
      {/* Luces de fondo (Glow) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-lg px-6">
        
        {/* Logo de NEXUS FA */}
        <div className="flex items-center mb-10 animate-pulse">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-3 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            N
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-widest text-white leading-tight">
              NEXUS FA
            </h1>
            <span className="text-[0.60rem] text-gray-400 tracking-[0.3em] font-medium uppercase">
              Wealth Management
            </span>
          </div>
        </div>

        {/* --- CONTENEDOR DE LA GRÁFICA --- */}
        <div className="w-full bg-[#131722]/80 border border-gray-800/80 rounded-2xl p-6 mb-8 shadow-2xl backdrop-blur-sm">
          
          {/* Cabecera del panel de gráfica */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-xs text-gray-400 tracking-wider uppercase font-semibold block mb-1">
                Cargando Portafolio
              </span>
              <div className="text-3xl font-bold text-white flex items-end leading-none">
                {progress.toFixed(1)}<span className="text-lg text-emerald-400 ml-1 mb-0.5">%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-medium flex items-center justify-end bg-emerald-400/10 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> ALTA VELOCIDAD
              </span>
            </div>
          </div>

          {/* Área SVG de la Gráfica */}
          <div className="relative w-full h-32">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Máscara de recorte que crece con el progreso */}
                <clipPath id="progressClip">
                  <rect x="0" y="0" width={currentX} height={viewBoxHeight + 20} />
                </clipPath>

                {/* Gradiente para el área bajo la línea */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradiente para la línea */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" /> {/* Azul */}
                  <stop offset="100%" stopColor="#34d399" /> {/* Esmeralda */}
                </linearGradient>
              </defs>

              {/* Líneas de cuadrícula (Grid) de fondo */}
              <line x1="0" y1="30" x2={viewBoxWidth} y2="30" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2={viewBoxWidth} y2="60" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2={viewBoxWidth} y2="90" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />

              {/* GRÁFICA ACTIVA (Recortada por la máscara) */}
              <g clipPath="url(#progressClip)">
                {/* Área con gradiente */}
                <path d={fillPath} fill="url(#areaGradient)" />
                
                {/* Línea de tendencia */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3" 
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                />
              </g>

              {/* Punto Brillante (Glow Dot) siguiendo la punta de la línea */}
              {progress > 0 && progress < 100 && (
                <g transform={`translate(${currentX}, ${dotY})`}>
                  <circle r="6" fill="#34d399" fillOpacity="0.3" className="animate-ping" />
                  <circle r="3.5" fill="#ffffff" className="drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Mensajes Dinámicos Inferiores */}
        <div className="h-6 flex items-center justify-center transition-all duration-300 w-full">
          <div className="flex items-center space-x-3">
            <div className="animate-pulse">
              {loadingMessages[messageIndex].icon}
            </div>
            <span className="text-sm font-medium text-gray-300">
              {loadingMessages[messageIndex].text}
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
