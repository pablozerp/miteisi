'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';

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

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, text: '', color: '' };
    if (p.length < 4) return { level: 1, text: 'Muy débil', color: '#ff4b4b' };
    if (p.length < 6) return { level: 2, text: 'Débil', color: '#ff8c00' };
    if (p.length < 8) return { level: 3, text: 'Aceptable', color: '#D16900' };
    if (p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p)) return { level: 5, text: 'Fuerte', color: '#22c55e' };
    return { level: 4, text: 'Buena', color: '#3B82F6' };
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
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: 'linear-gradient(135deg, #060e20 0%, #0b1326 50%, #0d1a3a 100%)' }}
    >
      <div className="glass-card p-8 w-full max-w-md relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span style={{ color: '#3B82F6' }}>Academi</span>
            <span style={{ color: '#D16900' }}>Code</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8b95b0' }}>
            Crea tu cuenta de estudiante
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'rgba(255, 75, 75, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255, 75, 75, 0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b95b0' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Juan Pérez"
              className="input-glass"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b95b0' }}>
              Cédula (opcional)
            </label>
            <input
              type="text"
              placeholder="V-00.000.000"
              className="input-glass"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              className="input-glass"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
            {/* Strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: strength.color }}>
                  {strength.text}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b95b0' }}>
              Semestre (opcional)
            </label>
            <select
              className="input-glass"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={`${s}° Semestre`} style={{ background: '#0b1326' }}>
                  {s}° Semestre
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Registrando...' : 'Crear mi Cuenta'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm" style={{ color: '#8b95b0' }}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="font-semibold hover:underline" style={{ color: '#3B82F6' }}>
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}
