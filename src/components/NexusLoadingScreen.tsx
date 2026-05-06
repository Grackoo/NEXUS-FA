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
    <div className="min-h-screen bg-[#0b0e14] pt-8 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4 mt-6 animate-pulse">
        <div className="w-32 h-8 bg-gray-800/80 rounded-lg"></div>
        <div className="flex gap-4">
           <div className="w-10 h-10 bg-gray-800/80 rounded-full"></div>
           <div className="w-10 h-10 bg-gray-800/80 rounded-full"></div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
        {/* Balance Card */}
        <div className="lg:col-span-1 h-64 bg-gray-800/60 rounded-3xl border border-white/5 flex flex-col justify-center p-8">
          <div className="w-24 h-4 bg-gray-700 rounded mb-4"></div>
          <div className="w-48 h-10 bg-gray-600 rounded mb-6"></div>
          <div className="w-16 h-6 bg-gray-700 rounded"></div>
        </div>
        
        {/* Chart Card */}
        <div className="lg:col-span-2 h-64 bg-gray-800/40 rounded-3xl border border-white/5 p-6 flex flex-col">
           <div className="w-32 h-4 bg-gray-700 rounded mb-auto"></div>
           <div className="w-full h-32 bg-gray-700/50 rounded-xl mt-4"></div>
        </div>

        {/* Donut Card */}
        <div className="lg:col-span-1 h-64 bg-gray-800/60 rounded-3xl border border-white/5 p-6 flex items-center justify-center">
           <div className="w-32 h-32 bg-gray-700/50 rounded-full border-8 border-gray-600/50"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full flex-1 bg-gray-800/40 rounded-3xl border border-white/5 animate-pulse p-6 mt-4 flex flex-col gap-4">
         <div className="w-48 h-6 bg-gray-700 rounded mb-4"></div>
         {[1, 2, 3, 4, 5].map(i => (
           <div key={i} className="w-full h-12 bg-gray-700/30 rounded-xl"></div>
         ))}
      </div>
    </div>
  );
}
