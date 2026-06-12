/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ChatPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (!token) { router.push('/login'); return; }
    setUserName(name || 'Estudiante');

    // Decodificar userId del token JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);
    } catch (e) {
      console.error('Error decodificando token', e);
    }

    loadUsers(token);
  }, []);

  const loadUsers = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar el usuario actual del lado del cliente como doble seguridad
      let myId;
      try { myId = JSON.parse(atob(token.split('.')[1])).userId; } catch { myId = null; }
      setUsers((res.data.users || []).filter(u => u.id !== myId));
    } catch (err) {
      console.error('Error cargando usuarios', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden bg-transparent">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[700px] h-[700px] bg-blue-600/10 top-[-100px] left-[-100px]" />
      <div className="bg-orb w-[500px] h-[500px] bg-indigo-600/10 bottom-0 right-[-100px]" />

      <Navbar userName={userName} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Chat</h2>
              <p className="text-slate-400 text-sm">Mensajes directos entre docentes y estudiantes</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="glass-card p-6 animate-fade-in-up delay-100">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usuarios disponibles
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">No hay otros usuarios disponibles aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setActiveChat(user)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                    activeChat?.id === user.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                      {(user.firstName || user.name || 'U').charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-sm truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN' || user.role === 'SUPERADMIN'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role === 'SUPERADMIN' ? 'Super Administrador' : (user.role === 'ADMIN' ? 'Docente' : 'Estudiante')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tip cuando no hay chat activo */}
        {!activeChat && !loading && (
          <div className="mt-6 text-center text-slate-500 text-sm animate-fade-in-up delay-200">
            Selecciona un usuario de la lista para iniciar una conversación.
          </div>
        )}
      </main>

      {/* Chat Window flotante */}
      {activeChat && currentUserId && (
        <ChatWindow
          currentUserId={currentUserId}
          otherUser={activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
