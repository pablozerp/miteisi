'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import RoadmapCanvas from '@/components/RoadmapCanvas';
import { generateRoadmap, getMyRoadmaps } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [nodes, setNodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [recentRoadmaps, setRecentRoadmaps] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (!token) {
      router.push('/login');
      return;
    }
    setUserName(name || 'Estudiante');
    loadRecentRoadmaps();
  }, []);

  const loadRecentRoadmaps = async () => {
    try {
      const data = await getMyRoadmaps();
      setRecentRoadmaps(data.roadmaps || []);
    } catch (err) {
      console.log('No se pudieron cargar las rutas recientes');
    }
  };

  const handleSearch = async (language) => {
    setLoading(true);
    setError('');
    setCurrentLanguage(language);
    try {
      const data = await generateRoadmap(language);
      setNodes(data.nodes);
      loadRecentRoadmaps(); // Actualizar lista
    } catch (err) {
      setError('Error al generar la hoja de ruta. Verifica tu conexión o intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleLoadRoadmap = (roadmap) => {
    setNodes(roadmap.nodesData);
    setCurrentLanguage(roadmap.language);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: 'linear-gradient(135deg, #060e20 0%, #0b1326 50%, #0d1a3a 100%)' }}
    >
      {/* Navbar */}
      <Navbar userName={userName} onLogout={handleLogout} />

      {/* Search Section */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#dae2fd' }}>
          ¿Qué lenguaje de programación quieres aprender?
        </h2>
        <p className="text-sm mb-4" style={{ color: '#8b95b0' }}>
          Escribe un lenguaje y la IA generará tu plan de estudios personalizado
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Stats Cards */}
      {recentRoadmaps.length > 0 && !nodes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          {/* Card: Total Roadmaps */}
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-extrabold" style={{ color: '#3B82F6' }}>
              {recentRoadmaps.length}
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b95b0' }}>Hojas de Ruta</p>
          </div>
          {/* Card: Total Nodes */}
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-extrabold" style={{ color: '#D16900' }}>
              {recentRoadmaps.reduce((sum, r) => sum + (r.nodeCount || 0), 0)}
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b95b0' }}>Temas Totales</p>
          </div>
          {/* Card: Languages */}
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-extrabold" style={{ color: '#3B82F6' }}>
              {[...new Set(recentRoadmaps.map((r) => r.language))].length}
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b95b0' }}>Lenguajes</p>
          </div>
        </div>
      )}

      {/* Recent Roadmaps */}
      {recentRoadmaps.length > 0 && !nodes && (
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#dae2fd' }}>
            📂 Rutas Recientes
          </h3>
          <div className="space-y-2">
            {recentRoadmaps.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="glass-card p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                onClick={() => handleLoadRoadmap(r)}
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div>
                  <p className="font-semibold" style={{ color: '#dae2fd' }}>{r.language}</p>
                  <p className="text-xs" style={{ color: '#8b95b0' }}>
                    {r.nodeCount} nodos · {new Date(r.createdAt).toLocaleDateString('es-VE')}
                  </p>
                </div>
                <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>
                  Ver ruta →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-3 rounded-lg text-sm text-center"
          style={{ background: 'rgba(255, 75, 75, 0.15)', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {/* Roadmap Canvas */}
      {nodes && (
        <div>
          <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto">
            <h3 className="text-lg font-bold" style={{ color: '#dae2fd' }}>
              🗺️ Hoja de Ruta:{' '}
              <span style={{ color: '#3B82F6' }}>{currentLanguage}</span>
            </h3>
            <button
              onClick={() => { setNodes(null); setCurrentLanguage(''); }}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#8b95b0', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← Volver al panel
            </button>
          </div>
          <div className="max-w-6xl mx-auto">
            <RoadmapCanvas roadmapNodes={nodes} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!nodes && !loading && recentRoadmaps.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-5xl mb-4">🚀</p>
          <p className="text-lg font-semibold" style={{ color: '#8b95b0' }}>
            Ingresa un lenguaje de programación para comenzar
          </p>
          <p className="text-sm mt-2" style={{ color: '#5a6380' }}>
            La IA generará un plan de estudios completo con documentación y videos
          </p>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="text-center mt-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4"
            style={{ borderColor: '#3B82F6', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-base" style={{ color: '#8b95b0' }}>
            🤖 La IA está generando tu hoja de ruta para <span className="font-bold" style={{ color: '#3B82F6' }}>{currentLanguage}</span>...
          </p>
          <p className="text-sm mt-1" style={{ color: '#5a6380' }}>
            Esto puede tomar unos segundos
          </p>
        </div>
      )}
    </div>
  );
}
