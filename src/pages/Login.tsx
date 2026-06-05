import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, ChevronRight, Globe, TrendingUp, AlertCircle, UserPlus, X, Briefcase, HelpCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import NexusBootScreen from '../components/NexusBootScreen';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const { login, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    const urlPass = params.get('pass');
    
    if (urlId && urlPass) {
      setUserId(urlId);
      setPassword(urlPass);
    }
  }, []);

  useEffect(() => {
    if (!isBooting && !isAuthLoading && userId && password) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('id') && params.get('pass')) {
        const doAutoLogin = async () => {
          setIsSubmitting(true);
          const result = await login(userId, password);
          if (!result.success) {
            setError(result.message || 'Error de acceso en auto-login.');
            setIsSubmitting(false);
          }
        };
        doAutoLogin();
        // Clear params from URL so it doesn't trigger again on logout
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isBooting, isAuthLoading, userId, password, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const result = await login(userId, password);
      if (!result.success) {
        setError(result.message || 'Error de acceso.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Falla en la conexión con el servidor.');
      setIsSubmitting(false);
    }
  };

  if (isBooting || isAuthLoading) {
    return <NexusBootScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020202] relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10 animate-fade-in flex flex-col items-center">
        <div className="flex flex-col items-center mb-10 group">
          <div className="w-20 h-20 rounded-[24px] bg-primary flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(26,92,255,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            <span className="text-4xl font-black">N</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white leading-tight" style={{ background: 'linear-gradient(135deg, #FFF 0%, #AAA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS FA</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 font-medium">Digital Wealth Management</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full bg-white/[0.02] backdrop-blur-3xl p-8 sm:p-10 rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(26,92,255,0.15)] space-y-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
          <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[150px] h-[100px] bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-2 text-center relative z-10">
            <h2 className="text-2xl font-bold tracking-tight text-white">Acceso Exclusivo</h2>
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 opacity-80">
               <Shield className="w-3 h-3" /> Security Protocol v4.0
            </p>
          </div>

          <div className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ID de Socio</label>
              <div className="relative group">
                <input 
                  type="text" 
                  autoFocus
                  className={`w-full bg-white/[0.04] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.08] focus:border-primary/60 focus:shadow-[0_0_20px_rgba(26,92,255,0.2)] transition-all outline-none ${error ? 'border-crimson/50' : ''}`} 
                  placeholder="IDXXXXX" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim().toUpperCase())}
                  required
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className={`w-full bg-white/[0.04] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.08] focus:border-primary/60 focus:shadow-[0_0_20px_rgba(26,92,255,0.2)] transition-all outline-none ${error ? 'border-crimson/50' : ''}`} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-crimson/10 border border-crimson/20 text-crimson text-[11px] font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold rounded-xl py-4 flex items-center justify-center shadow-[0_0_30px_rgba(26,92,255,0.3)] hover:shadow-[0_0_50px_rgba(26,92,255,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    INGRESAR A CARTERA
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                <UserPlus className="w-4 h-4" />
                Nueva Solicitud de Cuenta
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col items-center relative z-10">
             <div className="flex items-center gap-6 text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><TrendingUp className="w-3 h-3" /> Markets</span>
                <span className="hover:text-white transition-colors cursor-pointer">Security</span>
                <span className="hover:text-white transition-colors cursor-pointer">Insight</span>
             </div>
          </div>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-10 uppercase tracking-widest font-medium opacity-60">© 2026 NEXUS Financial Architecture. All rights reserved.</p>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
};

const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', occupation: '', manualOccupation: '', savings: '',
    goal: '', risk: 'Media', problem: '', experience: ''
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#050505] w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 flex flex-col max-h-[95vh] relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
        
        <div className="px-6 sm:px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
           <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5 text-primary" />
                Nueva Solicitud
              </h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Paso {step} de 2</p>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 transition-colors outline-none" 
                  placeholder="Tu nombre aquí" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Ocupación o Profesión
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 transition-colors outline-none col-span-2 sm:col-span-1"
                  >
                    <option value="">Seleccionar...</option>
                    {occupations.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                  </select>
                  {formData.occupation === 'Otro' && (
                    <input 
                      type="text" 
                      value={formData.manualOccupation}
                      onChange={(e) => setFormData({...formData, manualOccupation: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 transition-colors outline-none col-span-2 sm:col-span-1" 
                      placeholder="Especifica tu ocupación" 
                    />
                  )}
                </div>
              </div>

              <button 
                disabled={!formData.name || !formData.occupation}
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white font-bold rounded-xl py-3.5 flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2 text-sm text-gray-400">
                <p>Por favor completa los detalles económicos para tu perfil de inversionista.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <HelpCircle className="w-3 h-3 text-primary" /> ¿Porcentaje de ahorro mensual?
                </label>
                <input 
                  type="text" 
                  value={formData.savings}
                  onChange={(e) => setFormData({...formData, savings: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 transition-colors outline-none" 
                  placeholder="Ej: 10%, 20%..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Financiera Principal</label>
                <textarea 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 transition-colors outline-none min-h-[80px]" 
                  placeholder="Ej: Retiro, Libertad financiera..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nivel de Riesgo</label>
                <div className="flex gap-2">
                  {['Bajo', 'Media', 'Alta'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, risk: r})}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-colors border ${formData.risk === r ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(26,92,255,0.4)]' : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06]'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Problema a Solucionar</label>
                <input 
                  type="text" 
                  value={formData.problem}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 transition-colors outline-none" 
                  placeholder="Ej: Falta de ahorro, deudas..." 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-colors">
                  Atrás
                </button>
                <button onClick={handleSend} className="flex-[2] py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  Finalizar solicitud
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
