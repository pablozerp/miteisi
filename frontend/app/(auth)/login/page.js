'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

const CODE_PARTICLES = ['{ }', '< />', 'fn()', '[ ]', '===', '&&', '=>', '++', '/**/', '0x1F'];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060e20 0%, #0b1326 50%, #0d1a3a 100%)' }}
    >
      {/* Floating Code Particles */}
      {CODE_PARTICLES.map((code, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${10 + (i * 8) % 80}%`,
            animationDuration: `${12 + i * 3}s`,
            animationDelay: `${i * 1.5}s`,
            color: i % 2 === 0 ? '#3B82F6' : '#D16900',
          }}
        >
          {code}
        </span>
      ))}

      {/* Login Card */}
      <div className="glass-card p-8 w-full max-w-md relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span style={{ color: '#3B82F6' }}>Academi</span>
            <span style={{ color: '#D16900' }}>Code</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#D16900' }}>
            PLATAFORMA ACADÉMICA · UNERG
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'rgba(255, 75, 75, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255, 75, 75, 0.2)' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b95b0' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="correo@unerg.edu.ve"
              className="input-glass"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b95b0' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-glass"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center mt-5 text-sm" style={{ color: '#8b95b0' }}>
          ¿No tienes cuenta?{' '}
          <a
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: '#D16900' }}
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </main>
  );
}
