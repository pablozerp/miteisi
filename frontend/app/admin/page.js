'use client';
import { useEffect, useState } from 'react';
import { getAdminStats, getWeeklyStats } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, weekly] = await Promise.all([
        getAdminStats(),
        getWeeklyStats()
      ]);
      setStats(statsData);
      setWeeklyData(weekly);
    } catch (err) {
      console.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold mb-8">
        Panel de <span className="text-gradient">Estadísticas</span>
      </h2>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Card Usuarios */}
            <div className="glass-card p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]">
                👥
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white">{stats.totalUsers}</p>
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mt-1">Usuarios Registrados</p>
              </div>
            </div>

            {/* Card Rutas */}
            <div className="glass-card p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]">
                🗺️
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white">{stats.totalRoadmaps}</p>
                <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider mt-1">Hojas de Ruta Generadas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico Semanal */}
            <div className="glass-card p-8 lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                📈 Actividad de los últimos 7 días
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b1326', borderColor: '#ffffff1a', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="usuarios" name="Nuevos Usuarios" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="rutas" name="Rutas Creadas" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Lenguajes */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                🔥 Top Lenguajes
              </h3>
              <div className="space-y-4">
                {stats.topLanguages.map((lang, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg">
                        {i + 1}
                      </div>
                      <span className="font-bold text-lg text-white">{lang.language}</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 text-sm">
                      {lang.count}
                    </span>
                  </div>
                ))}
                {stats.topLanguages.length === 0 && (
                  <p className="text-slate-400 text-center py-4">Aún no hay rutas generadas</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
