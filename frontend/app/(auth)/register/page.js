'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api';

const CODE_PARTICLES = ['{ }', '< />', 'fn()', '[ ]', '===', '&&', '=>', '++', '/**/', '0x1F', 'null', '()', 'async', 'await'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    cedula: '',
    email: '',
    password: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, []);

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, text: '', color: '' };
    if (p.length < 4) return { level: 1, text: 'Muy débil', color: 'bg-red-500', textColor: 'text-red-400' };
    if (p.length < 6) return { level: 2, text: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (p.length < 8) return { level: 3, text: 'Aceptable', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p)) return { level: 5, text: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-400' };
    return { level: 4, text: 'Buena', color: 'bg-blue-500', textColor: 'text-blue-400' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerUser(form);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
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

      <div className="glass-card glass-card-hover p-8 md:p-10 w-full max-w-[500px] relative z-10 mx-4 animate-fade-in-up">
        {/* Shimmer Effect */}
        <div className="shimmer-bg" />

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(209,105,0,0.3)] overflow-hidden">
            <img src="/logo-academicode.png" alt="AcademiCode Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="text-gradient">Crear Cuenta</span>
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Únete a AcademiCode
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm text-center bg-red-500/10 text-red-400 border border-red-500/20 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl text-sm text-center bg-green-500/10 text-green-400 border border-green-500/20 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-fade-in-up delay-100">
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                Nombre Completo
              </label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="input-glass"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in-up delay-100">
              <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
                Cédula <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
              </label>
              <div className="input-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <input
                  type="text"
                  placeholder="V-00.000.000"
                  className="input-glass"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up delay-200">
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Correo Electrónico
            </label>
            <div className="input-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="correo@unerg.edu.ve"
                className="input-glass"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="animate-fade-in-up delay-300">
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Contraseña
            </label>
            <div className="input-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="input-glass"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            {/* Strength bar */}
            {form.password && (
              <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-2 font-medium ${strength.textColor}`}>
                  Nivel de seguridad: {strength.text}
                </p>
              </div>
            )}
          </div>

          <div className="animate-fade-in-up delay-400">
            <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between">
              Semestre <span className="text-[10px] uppercase text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded">Opcional</span>
            </label>
            <div className="input-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              <select
                className="input-glass"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              >
                <option value="" className="bg-[#0b1326]">Selecciona tu semestre...</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={`${s}° Semestre`} className="bg-[#0b1326]">
                    {s}° Semestre
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 animate-fade-in-up delay-400">
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-4 text-base flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
                  <span>Crear mi Cuenta</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400 relative z-10 animate-fade-in-up delay-[500ms]">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors hover:underline underline-offset-4 decoration-blue-500/50">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
