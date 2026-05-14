import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink, PlayCircle } from 'lucide-react';

interface AcademyModule {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  duration: string;
}

const mockModules: AcademyModule[] = [
  {
    id: '1',
    title: 'Fundamentos y Mentalidad Financiera',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=400&auto=format&fit=crop',
    link: 'https://fa-academy.vercel.app/academy/fase-1',
    duration: '15 min'
  },
  {
    id: '2',
    title: 'El Ecosistema de Inversión',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop',
    link: 'https://fa-academy.vercel.app/academy/fase-2',
    duration: '22 min'
  },
  {
    id: '3',
    title: 'Análisis Técnico y Gráficos',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop',
    link: 'https://fa-academy.vercel.app/academy/fase-3',
    duration: '30 min'
  },
  {
    id: '4',
    title: 'Gestión de Riesgo y Portafolio',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop',
    link: 'https://fa-academy.vercel.app/academy/fase-4',
    duration: '18 min'
  },
  {
    id: '5',
    title: 'Estrategias Especializadas',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop',
    link: 'https://fa-academy.vercel.app/academy/fase-5',
    duration: '25 min'
  }
];

export const AcademyCarousel: React.FC = () => {
  return (
    <div className="glass-card p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">FA Academy</h2>
          <p className="text-xs text-gray-400">Eleva tu inteligencia financiera</p>
        </div>
      </div>

      <div className="relative z-10 overflow-x-auto scrollbar-hide pb-4">
        <div className="flex gap-4" style={{ width: 'max-content' }}>
          {mockModules.map((module, index) => (
            <motion.a
              href={module.link}
              target="_blank"
              rel="noopener noreferrer"
              key={module.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group w-64 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img 
                  src={module.thumbnail} 
                  alt={module.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white/80" />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white">
                  {module.duration}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{module.title}</h3>
                <div className="flex items-center text-[10px] text-purple-400 font-bold uppercase tracking-widest gap-1">
                  Ver módulo <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyCarousel;
