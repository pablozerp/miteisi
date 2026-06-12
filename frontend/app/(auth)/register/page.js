/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api';

const CODE_PARTICLES = ['{ }', '</ >', 'fn()', '[ ]', '===', '&&', '=>', '++', '/**/', '0x1F', 'null', '()', 'async', 'await'];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    phone: '',
    cedula: '',
    email: '',
    password: '',
    confirmPassword: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.replace('/dashboard');
  }, []);

  const passwordRequirements = [
    { id: 'length', label: '8 caracteres mínimo', regex: /.{8,}/ },
    { id: 'upper', label: 'Una mayúscula', regex: /[A-Z]/ },
    { id: 'number', label: 'Un número', regex: /\d/ },
    { id: 'special', label: 'Un carácter especial (@$!%*?&)', regex: /[@$!%*?&]/ },
  ];

  const validateStep1 = () => {
    if (!form.firstName.trim()) return 'El nombre es obligatorio';
    if (!form.lastName.trim()) return 'El apellido es obligatorio';
    if (!form.phone.trim()) return 'El telefono es obligatorio';
    if (!/^\d{7,15}$/.test(form.phone.replace(/\D/g, ''))) return 'Ingresa un numero de telefono valido';
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError('La contraseña no cumple con los requisitos.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setLoading(true);
    try {
      await registerUser(form);
      setSuccess('Cuenta creada exitosamente! Redirigiendo al login...');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 bg-transparent">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[600px] h-[600px] bg-blue-600/20 top-[-100px] left-[-200px]" />
      <div className="bg-orb w-[500px] h-[500px] bg-orange-600/10 bottom-[-100px] right-[-100px]" />

      {/* Floating Code Particles */}
      {CODE_PARTICLES.map((code, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            animationDuration: `${15 + i * 2}s`,
            animationDelay: `${i * 1.5}s`,
            color: i % 2 === 0 ? 'var(--primary-light)' : 'var(--accent-light)',
          }}
        >
          {code}
        </span>
      ))}

      <div className="glass-card glass-card-hover p-8 md:p-10 w-full max-w-[520px] relative z-10 mx-4 animate-fade-in-up">
        <div className="shimmer-bg" />

        {/* Logo + Title */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(209,105,0,0.3)] overflow-hidden">
            <img src="/logo-academicode.png" alt="AcademiCode Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="text-gradient">Crear Cuenta</span>
          </h1>
          <p className="text-sm font-medium text-slate-400">Unete a AcademiCode</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-7 relative z-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 shrink-0
                  ${step === s ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' :
                    step > s ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                    'bg-white/5 border border-white/10 text-slate-500'}`}
              >
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <div className="ml-2 text-xs flex flex-col leading-none">
                <span className={`font-bold ${step === s ? 'text-white' : step > s ? 'text-green-400' : 'text-slate-500'}`}>
                  {s === 1 ? 'Datos Personales' : 'Datos Academicos'}
                </span>
                <span className="text-slate-600 text-[10px] mt-0.5">
                  {s === 1 ? 'Nombre y contacto' : 'Acceso a la plataforma'}
                </span>
              </div>
              {s < 2 && (
                <div className={`ml-3 flex-1 h-px transition-all duration-500 ${step > 1 ? 'bg-gradient-to-r from-green-500/50 to-blue-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Error / Success */}
        {error && (
          <div className="mb-5 p-4 rounded-xl text-sm text-center bg-red-500/10 text-red-400 border border-red-500/20 animate-fade-in-up flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 rounded-xl text-sm text-center bg-green-500/10 text-green-400 border border-green-500/20 animate-fade-in-up flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* ============ STEP 1 ============ */}
        {step === 1 && (
          <div className="space-y-4 relative z-10 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primer Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Primer Nombre <span className="text-red-400">*</span></label>
                <div className="input-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    className="input-glass"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    autoFocus
                  />
                </div>
              </div>
              {/* Segundo Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
                  Segundo Nombre <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <div className="input-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="middleName"
                    type="text"
                    placeholder="Jose"
                    className="input-glass"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  />
                </div>
              </div>
              {/* Primer Apellido */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Primer Apellido <span className="text-red-400">*</span></label>
                <div className="input-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Perez"
                    className="input-glass"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
              {/* Segundo Apellido */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
                  Segundo Apellido <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <div className="input-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="secondLastName"
                    type="text"
                    placeholder="Gonzalez"
                    className="input-glass"
                    value={form.secondLastName}
                    onChange={(e) => setForm({ ...form, secondLastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Numero de Telefono <span className="text-red-400">*</span></label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+58 412 000 0000"
                  className="input-glass"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Cedula (opcional) */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
                Cedula <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
              </label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <input
                  id="cedula"
                  type="text"
                  placeholder="V-00.000.000"
                  className="input-glass"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-gradient w-full py-4 text-base flex items-center justify-center gap-2 group"
              >
                <span>Continuar</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ============ STEP 2 ============ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10 animate-fade-in-up">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Correo Electronico <span className="text-red-400">*</span></label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="correo@unerg.edu.ve"
                  className="input-glass"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Contrasena <span className="text-red-400">*</span></label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ chars, mayúscula, num, especial"
                  className="input-glass pr-12"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.354-2.836M15.536 8.464a10.05 10.05 0 012.006 1.7A10.05 10.05 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-.84 0-1.65-.11-2.43-.311M9 12a3 3 0 003 3m-3-3a3 3 0 013-3m-3 3l6 6m-6-6l-6-6" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-3 bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                <p className="text-xs font-semibold text-slate-300 mb-3">Requisitos de la contraseña:</p>
                <ul className="space-y-2 text-xs">
                  {passwordRequirements.map(req => {
                    const isValid = req.regex.test(form.password);
                    return (
                      <li key={req.id} className={`flex items-center gap-2.5 transition-colors duration-300 ${isValid ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 ${isValid ? 'bg-green-500/20' : 'bg-slate-500/10'}`}>
                          <svg className={`w-3 h-3 transition-transform duration-300 ${isValid ? 'scale-110 text-green-400' : 'opacity-50 text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isValid ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                        </div>
                        <span className="font-medium tracking-wide">{req.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Confirmar Contraseña <span className="text-red-400">*</span></label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Vuelve a escribir tu contraseña"
                  className="input-glass pr-12"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  onMouseDown={() => setShowConfirmPassword(true)}
                  onMouseUp={() => setShowConfirmPassword(false)}
                  onMouseLeave={() => setShowConfirmPassword(false)}
                  onTouchStart={() => setShowConfirmPassword(true)}
                  onTouchEnd={() => setShowConfirmPassword(false)}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.354-2.836M15.536 8.464a10.05 10.05 0 012.006 1.7A10.05 10.05 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7-.84 0-1.65-.11-2.43-.311M9 12a3 3 0 003 3m-3-3a3 3 0 013-3m-3 3l6 6m-6-6l-6-6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Semestre */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
                Semestre <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
              </label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <select
                  id="semester"
                  className="input-glass"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                >
                  <option value="" className="bg-[#0b1326]">Selecciona tu semestre...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={`${s} Semestre`} className="bg-[#0b1326]">{s} Semestre</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all font-semibold flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Atras
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-gradient py-3 text-base flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="text-center mt-7 text-sm text-slate-400 relative z-10">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline underline-offset-4 decoration-blue-500/50">
            Inicia sesion aqui
          </Link>
        </p>
      </div>
    </main>
  );
}
