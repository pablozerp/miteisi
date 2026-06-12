/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
      localStorage.setItem('userRole', data.role || 'USER');
      router.replace('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[600px] h-[600px] bg-blue-600/20 top-[-100px] left-[-200px]" />
      <div className="bg-orb w-[500px] h-[500px] bg-orange-600/10 bottom-[-100px] right-[-100px]" />

      {/* Login Card */}
      <div className="glass-card glass-card-hover p-10 w-full max-w-md relative z-10 mx-4 animate-fade-in-up">
        {/* Shimmer Effect */}
        <div className="shimmer-bg" />

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] overflow-hidden">
            <img src="/logo-academicode.png" alt="AcademiCode Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-gradient">AcademiCode</span>
          </h1>
          <p className="text-xs tracking-[0.2em] font-semibold text-orange-400 uppercase">
            Plataforma Académica · UNERG
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Error */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="animate-fade-in-up delay-100">
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

          <div className="animate-fade-in-up delay-200">
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Contraseña
            </label>
            <div className="input-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input-glass pr-12"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
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
          </div>

          <div className="pt-2 animate-fade-in-up delay-300">
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
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Register link */}
        <p className="text-center mt-8 text-sm text-slate-400 relative z-10 animate-fade-in-up delay-400">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-bold text-orange-400 hover:text-orange-300 transition-colors hover:underline underline-offset-4 decoration-orange-500/50"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
