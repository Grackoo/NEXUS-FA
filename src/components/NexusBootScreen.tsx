import { useState, useEffect } from 'react';
import { Cpu, Server, Shield, Database } from 'lucide-react';

interface NexusBootScreenProps {
  onComplete: () => void;
}

export default function NexusBootScreen({ onComplete }: NexusBootScreenProps) {
  const [progress, setProgress] = useState(0);

  // Fases de carga simulando el arranque de un sistema complejo (Motor)
  const bootStages = [
    { threshold: 0, text: "INICIANDO SISTEMAS CORE...", icon: <Cpu className="w-3 h-3 text-blue-500 mr-2" /> },
    { threshold: 25, text: "ESTABLECIENDO PROTOCOLOS DE SEGURIDAD...", icon: <Shield className="w-3 h-3 text-emerald-400 mr-2" /> },
    { threshold: 50, text: "CONECTANDO CON NODOS GLOBALES...", icon: <Server className="w-3 h-3 text-purple-400 mr-2" /> },
    { threshold: 75, text: "CARGANDO MOTOR DE INTERFAZ...", icon: <Database className="w-3 h-3 text-blue-400 mr-2" /> },
    { threshold: 95, text: "SISTEMA NEXUS ONLINE.", icon: <Shield className="w-3 h-3 text-emerald-500 mr-2" /> }
  ];

  useEffect(() => {
    // Simula una carga de 4 segundos para el arranque inicial
    const duration = 4000; 
    const interval = 30;
    const step = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => onComplete(), 500); // Pausa dramática al final
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Encuentra el texto actual basado en el progreso
  const currentStage = [...bootStages].reverse().find(stage => progress >= stage.threshold) || bootStages[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202] text-white relative overflow-hidden font-sans">
      
      {/* Luces de fondo ambientales */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Cuadrícula técnica de fondo (Cyber/Tech feel) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(31,41,55,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(31,41,55,0.15)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none mask-image-radial"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-lg px-6">
        
        {/* --- LOGO CENTRAL CON ANILLOS ROTATORIOS --- */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-12">
          
          {/* Anillo exterior punteado (Gira lento a la derecha) */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 6" />
          </svg>

          {/* Anillo medio sólido con huecos (Gira más rápido a la izquierda) */}
          <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="60 40 20 40" opacity="0.8" />
          </svg>

          {/* Anillo interior (Línea de progreso circular sutil) */}
          <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="46" fill="none" stroke="#1f2937" strokeWidth="2" />
             <circle 
                cx="50" cy="50" r="46" fill="none" 
                stroke="#ffffff" strokeWidth="2" strokeLinecap="round"
                strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100}
                className="transition-all duration-75 ease-linear"
                transform="rotate(-90 50 50)"
             />
          </svg>

          {/* Letra 'N' Brillante en el centro */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 text-white rounded-xl flex items-center justify-center text-3xl font-black shadow-[0_0_25px_rgba(26,92,255,0.6)] relative overflow-hidden">
             {/* Efecto de escaneo (Sweep) sobre el logo */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-y-full animate-[scan_2s_ease-in-out_infinite]"></div>
             N
          </div>
        </div>

        {/* TEXTOS DE MARCA */}
        <div className="flex flex-col items-center mb-16">
          <h1 className="text-3xl font-extrabold tracking-[0.3em] text-white leading-tight mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            NEXUS FA
          </h1>
          <span className="text-[0.65rem] text-primary/80 tracking-[0.4em] font-medium uppercase border-b border-blue-900/50 pb-1">
            Digital Wealth Management
          </span>
        </div>

        {/* TERMINAL DE ESTADO & BARRA LÍNEAL */}
        <div className="w-full max-w-sm flex flex-col">
          {/* Texto de terminal cambiante */}
          <div className="flex justify-between items-end mb-2 h-6">
            <div className="flex items-center text-[0.65rem] text-gray-400 font-mono tracking-wider">
               {currentStage.icon}
               <span className="animate-pulse">{currentStage.text}</span>
            </div>
            <div className="text-xs font-mono text-primary font-bold tabular-nums">
              {progress.toFixed(1)}%
            </div>
          </div>

          {/* Barra de progreso de Alta Precisión */}
          <div className="w-full h-[2px] bg-gray-800 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-emerald-400 to-white transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            >
              {/* Brillo en la punta de la barra */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] blur-[1px]"></div>
            </div>
          </div>

          {/* Detalles técnicos (falsos pero dan toque premium) */}
          <div className="flex justify-between mt-3 text-[0.55rem] text-gray-600 font-mono">
            <span>SECURE.NODE_ID: NX-8842-X</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>

      </div>

      <style>{`
        .mask-image-radial {
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
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
