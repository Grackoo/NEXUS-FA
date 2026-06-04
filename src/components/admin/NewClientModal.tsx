import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, Link as LinkIcon, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { registerNewClient } from '../../services/sheetsService';
import { useAuth } from '../../contexts/AuthContext';

interface NewClientModalProps {
  onClose: () => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ onClose }) => {
  const { registerLocalClient } = useAuth();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [generatedCreds, setGeneratedCreds] = useState<{ id: string, pass: string, link: string } | null>(null);

  const generateID = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 90) + 10; // 10 to 99
    return `${initials || 'CLI'}-${randomNum}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);

    const newId = generateID(formData.name);
    const newPass = generatePassword();
    const superLink = `${window.location.origin}/?id=${newId}&pass=${newPass}`;

    const newClient = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: newPass,
      role: 'client' as 'client',
    };

    // 1. Guardar en memoria/local storage para login inmediato
    registerLocalClient(newClient);

    // 2. Enviar a Google Sheets
    await registerNewClient(newClient);

    setGeneratedCreds({ id: newId, pass: newPass, link: superLink });
    setStep('success');
    setIsSubmitting(false);
  };

  const handleWhatsApp = () => {
    if (!generatedCreds) return;
    
    const text = `Hola ${formData.name.split(' ')[0]},\n\n` +
                 `Bienvenido a *NEXUS FA - Wealth Management*.\n\n` +
                 `Se ha creado tu perfil de inversionista con éxito.\n` +
                 `Aquí tienes tus credenciales de acceso:\n\n` +
                 `👤 *ID de Socio:* ${generatedCreds.id}\n` +
                 `🔑 *Contraseña:* ${generatedCreds.pass}\n\n` +
                 `Puedes acceder automáticamente haciendo clic en tu *Super Link* mágico aquí abajo:\n` +
                 `${generatedCreds.link}\n\n` +
                 `Si tienes dudas, avísame.`;

    const encodedText = encodeURIComponent(text);
    // Remove non-numeric characters from phone
    const cleanPhone = formData.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0E17] w-full max-w-md p-0 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/10 animate-fade-in mx-auto">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Nuevo Cliente
              </h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="glass-input" 
                  placeholder="Ej: Vannesa Ramirez" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico (Opcional)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="glass-input" 
                  placeholder="correo@ejemplo.com" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="glass-input" 
                  placeholder="Ej: 52 1 555 123 4567" 
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name || !formData.phone}
                  className="glass-button w-full shadow-lg h-12"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Registrar Cliente <ChevronRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">¡Cliente Registrado!</h3>
              <p className="text-[13px] text-gray-400">Las credenciales han sido generadas exitosamente.</p>
              
              {generatedCreds && (
                <div className="w-full bg-black/40 border border-white/10 rounded-xl p-5 space-y-4 text-left mt-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ID de Socio</span>
                    <span className="font-mono text-primary font-bold text-lg">{generatedCreds.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Contraseña</span>
                    <span className="font-mono text-white font-bold">{generatedCreds.pass}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Super Link (Auto-login)</span>
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                      <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-[11px] text-gray-300 truncate">{generatedCreds.link}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full pt-2 flex flex-col gap-3">
                <button 
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(37,211,102,0.15)]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar Accesos por WhatsApp
                </button>
                <button onClick={onClose} className="glass-button secondary w-full">
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewClientModal;
