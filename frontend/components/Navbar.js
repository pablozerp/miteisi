'use client';

export default function Navbar({ userName, onLogout }) {
  return (
    <nav className="glass-card px-6 py-3 flex items-center justify-between mb-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">
          <span style={{ color: '#3B82F6' }}>Academi</span>
          <span style={{ color: '#D16900' }}>Code</span>
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
          UNERG
        </span>
      </div>

      {/* User & Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: '#8b95b0' }}>
          👋 Hola, <span className="font-semibold" style={{ color: '#dae2fd' }}>{userName}</span>
        </span>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8b95b0',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#dae2fd'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#8b95b0'; }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
