'use client';
import Link from 'next/link';

export default function Navbar({ userName, onLogout }) {
  return (
    <nav className="glass-card px-6 py-4 flex items-center justify-between mb-8 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 overflow-hidden group-hover:border-blue-400/50 transition-colors">
          <img src="/logo-academicode.png" alt="AcademiCode Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-baseline gap-2">
            <span className="text-gradient group-hover:brightness-125 transition-all">AcademiCode</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              UNERG
            </span>
          </h1>
        </div>
      </Link>

      {/* User & Logout */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {userName ? userName.charAt(0).toUpperCase() : 'E'}
          </div>
          <span className="text-sm text-slate-300 font-medium">
            {userName}
          </span>
        </div>
        
        <button
          onClick={onLogout}
          className="btn-outline-glow flex items-center gap-2 group"
          title="Cerrar Sesión"
        >
          <span className="hidden sm:inline">Salir</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
