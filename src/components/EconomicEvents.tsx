import React from 'react';
import { EconomicCalendar } from 'react-ts-tradingview-widgets';
import { CalendarDays } from 'lucide-react';

export const EconomicEvents: React.FC = () => {
  return (
    <div className="glass-card p-6 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl h-full shadow-2xl flex flex-col relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-white tracking-tight">Calendario Económico</h2>
      </div>
      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 min-h-[350px] relative z-10">
        <EconomicCalendar 
          colorTheme="dark" 
          width="100%" 
          height="100%" 
          locale="es" 
          isTransparent={true} 
        />
      </div>
    </div>
  );
};

export default EconomicEvents;
