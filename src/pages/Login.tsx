import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, ChevronRight, Globe, TrendingUp, AlertCircle, UserPlus, X, Briefcase, HelpCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(userId);
    if (!success) {
      setError('Cliente no registrado. Verifica tu ID o contacta a soporte.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020202] relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rotate-45 pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 group">
          <div className="w-20 h-20 rounded-[28px] bg-primary flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(26,92,255,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            <span className="text-4xl font-black">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-gradient leading-tight">NEXUS FA</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 font-medium">Digital Wealth Management</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 space-y-6 animate-fade-in shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold tracking-tight">Acceso Exclusivo</h2>
            <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
               <Shield className="w-3 h-3 text-primary" /> Sistema de Gestión de Activos
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between ml-1">
                Identificación de Cliente
                <Lock className="w-3 h-3 opacity-30" />
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  autoFocus
                  className={`glass-input pl-12 text-center ${error ? 'border-crimson/50' : ''}`} 
                  placeholder="ID DE SOCIO" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-crimson/10 border border-crimson/20 text-crimson text-[10px] animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button type="submit" className="glass-button w-full shadow-[0_0_30px_rgba(26,92,255,0.3)] group h-14">
                INGRESAR A CARTERA
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
              >
                <UserPlus className="w-4 h-4" />
                Crear Cuenta
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-6 text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Markets</span>
                <span className="opacity-30">•</span>
                <span>Security</span>
                <span className="opacity-30">•</span>
                <span>Insight</span>
             </div>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-10 uppercase tracking-widest font-medium">© 2026 NEXUX Financial Architecture. All rights reserved.</p>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
};

const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    occupation: '',
    manualOccupation: '',
    savings: '',
    goal: '',
    risk: 'Media',
    problem: '',
    experience: ''
  });

  const occupations = [
    'Licenciatura', 'Negocio propio', 'Estudiante', 'Ingeniero', 
    'Arquitecto', 'Doctor', 'Freelancer', 'Empresario', 
    'Emprendedor', 'Barbero', 'Costurera', 'Otro'
  ];

  const handleSend = () => {
    const finalOccupation = formData.occupation === 'Otro' ? formData.manualOccupation : formData.occupation;
    const text = `🚀 *Solicitud de Nueva Cuenta NEXUS FA*\n\n` +
                 `👤 *Nombre:* ${formData.name}\n` +
                 `💼 *Ocupación:* ${finalOccupation}\n` +
                 `💰 *Ahorro Mensual:* ${formData.savings}\n` +
                 `🎯 *Meta Principal:* ${formData.goal}\n` +
                 `📊 *Riesgo:* ${formData.risk}\n` +
                 `⚠️ *Problema a Solucionar:* ${formData.problem}\n` +
                 `📈 *Inversiones Previas:* ${formData.experience}`;
    
    window.open(`https://wa.me/527711960057?text=${encodeURIComponent(text)}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card w-full max-w-lg p-0 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] border-white/10 animate-fade-in mx-auto">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Nueva Solicitud de Cuenta
              </h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Paso {step} de 2</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="glass-input" 
                  placeholder="Tu nombre aquí" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Ocupación o Profesión
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="glass-input col-span-2 sm:col-span-1"
                  >
                    <option value="">Seleccionar...</option>
                    {occupations.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                  </select>
                  {formData.occupation === 'Otro' && (
                    <input 
                      type="text" 
                      value={formData.manualOccupation}
                      onChange={(e) => setFormData({...formData, manualOccupation: e.target.value})}
                      className="glass-input col-span-2 sm:col-span-1" 
                      placeholder="Especifica tu ocupación" 
                    />
                  )}
                </div>
              </div>

              <button 
                disabled={!formData.name || !formData.occupation}
                onClick={() => setStep(2)}
                className="glass-button w-full shadow-lg"
              >
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <HelpCircle className="w-3 h-3 text-primary" /> ¿Qué porcentaje de tus ingresos logras ahorrar?
                </label>
                <input 
                  type="text" 
                  value={formData.savings}
                  onChange={(e) => setFormData({...formData, savings: e.target.value})}
                  className="glass-input" 
                  placeholder="Ej: 10%, 20%..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">¿Cuál es tu meta financiera principal?</label>
                <textarea 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="glass-input min-h-[80px]" 
                  placeholder="Ej: Comprar una casa, libertad financiera, retiro..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nivel de riesgo que estás dispuesto a asumir</label>
                <div className="flex gap-2">
                  {['Bajo', 'Media', 'Alta'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, risk: r})}
                      className={`risk-btn ${formData.risk === r ? 'active' : ''}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">¿Qué problema financiero te gustaría solucionar hoy?</label>
                <input 
                  type="text" 
                  value={formData.problem}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})}
                  className="glass-input" 
                  placeholder="Ej: Inflación, falta de ahorro, deudas..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">¿Has invertido anteriormente? ¿En qué?</label>
                <input 
                  type="text" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="glass-input" 
                  placeholder="Ej: No, Cetes, Acciones, Cripto..." 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="glass-button secondary flex-1">Atrás</button>
                <button onClick={handleSend} className="glass-button flex-[2] bg-emerald hover:bg-emerald/80 border-none">
                  Finalizar y Enviar a WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
