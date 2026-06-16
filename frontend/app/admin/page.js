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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-white">{stats.totalUsers}</p>
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mt-1">Usuarios Registrados</p>
              </div>
            </div>

            {/* Card Rutas */}
            <div className="glass-card p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
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
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg> Actividad de los últimos 7 días
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
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> Top Lenguajes
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
