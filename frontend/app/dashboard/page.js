'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import RoadmapCanvas from '@/components/RoadmapCanvas';
import NodeDetailPanel from '@/components/NodeDetailPanel';
import { generateRoadmap, getMyRoadmaps } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [nodes, setNodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [recentRoadmaps, setRecentRoadmaps] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

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
      setSelectedNode(null);
      loadRecentRoadmaps();
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
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden bg-transparent">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[800px] h-[800px] bg-blue-600/10 top-[-200px] left-[10%]" />
      <div className="bg-orb w-[600px] h-[600px] bg-orange-600/10 bottom-[-100px] right-[-100px]" />
      
      {/* Navbar */}
      <Navbar userName={userName} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            ¿Qué lenguaje de programación quieres <span className="text-gradient">aprender hoy</span>?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 font-medium">
            Nuestra IA generará un plan de estudios estructurado paso a paso con documentación oficial y videos seleccionados para ti.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Stats Cards */}
        {recentRoadmaps.length > 0 && !nodes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-4xl mx-auto animate-fade-in-up delay-200">
            {/* Card 1 */}
            <div className="glass-card glass-card-hover p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                🗺️
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">{recentRoadmaps.length}</p>
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Rutas Creadas</p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="glass-card glass-card-hover p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]">
                🎯
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">
                  {recentRoadmaps.reduce((sum, r) => sum + (r.nodeCount || 0), 0)}
                </p>
                <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Temas Totales</p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="glass-card glass-card-hover p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
                🚀
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">
                  {[...new Set(recentRoadmaps.map((r) => r.language))].length}
                </p>
                <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Lenguajes</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl text-sm text-center bg-red-500/10 text-red-400 border border-red-500/20 animate-fade-in-up flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Recent Roadmaps List */}
        {recentRoadmaps.length > 0 && !nodes && (
          <div className="max-w-4xl mx-auto mb-10 animate-fade-in-up delay-300">
            <div className="flex items-center gap-3 mb-6 pl-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Tus rutas recientes</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRoadmaps.slice(0, 6).map((r, i) => (
                <div
                  key={r.id}
                  className="glass-card group p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 bg-[#131b2e]/60"
                  onClick={() => handleLoadRoadmap(r)}
                  style={{ animation: `fade-in-up 0.5s ease-out ${(i * 100) + 400}ms both` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                      {r.language.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{r.language}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {r.nodeCount} nodos
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('es-VE', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap Canvas Area */}
        {nodes && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                  <div className="w-full h-full bg-[#0b1326] rounded-[10px] flex items-center justify-center">
                    <span className="text-2xl">🗺️</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hoja de Ruta</h3>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    {currentLanguage}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => { setNodes(null); setCurrentLanguage(''); setSelectedNode(null); }}
                className="btn-outline-glow flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Panel
              </button>
            </div>
            
            <div className="relative w-full overflow-hidden rounded-2xl flex">
              <div className={`flex-1 transition-all duration-500 ${selectedNode ? 'sm:mr-[380px]' : ''}`}>
                <RoadmapCanvas 
                  roadmapNodes={nodes} 
                  selectedNodeId={selectedNode?.id}
                  onNodeSelect={(nodeData) => setSelectedNode(nodeData)}
                />
              </div>
              <NodeDetailPanel 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)} 
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!nodes && !loading && recentRoadmaps.length === 0 && (
          <div className="text-center mt-20 animate-fade-in-up delay-300">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#171f33] to-[#0b1326] w-24 h-24 rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🚀</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Comienza tu viaje de aprendizaje</h3>
            <p className="text-slate-400 max-w-md mx-auto text-base">
              Ingresa cualquier tecnología o lenguaje arriba. La inteligencia artificial analizará los mejores recursos y creará un camino perfecto para ti.
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="text-center mt-24 animate-fade-in-up">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-orange-500/50 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Forjando tu camino de aprendizaje...
            </h3>
            <p className="text-slate-400 text-sm">
              Analizando estructura de <span className="text-blue-400 font-bold">{currentLanguage}</span> y buscando recursos.
            </p>
          </div>
        )}
        
      </main>
    </div>
  );
}
