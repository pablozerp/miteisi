'use client';
import { useState } from 'react';

const POPULAR_LANGUAGES = [
  { name: 'Python', icon: '🐍' },
  { name: 'JavaScript', icon: '⚡' },
  { name: 'Java', icon: '☕' },
  { name: 'C++', icon: '⚙️' },
  { name: 'Go', icon: '🐹' },
  { name: 'Rust', icon: '🦀' },
  { name: 'TypeScript', icon: '📘' }
];

// Pares de comparación sugeridos
const COMPARE_PAIRS = [
  { a: 'Python', b: 'JavaScript', iconA: '🐍', iconB: '⚡' },
  { a: 'React', b: 'Vue', iconA: '⚛️', iconB: '💚' },
  { a: 'Java', b: 'Kotlin', iconA: '☕', iconB: '🟣' },
  { a: 'SQL', b: 'MongoDB', iconA: '🗄️', iconB: '🍃' },
];

export default function SearchBar({ onSearch, onCompare, loading }) {
  const [mode, setMode] = useState('single'); // 'single' | 'compare'
  const [query, setQuery] = useState('');
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    if (queryA.trim() && queryB.trim() && onCompare) {
      onCompare(queryA.trim(), queryB.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up delay-100">

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              mode === 'single'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Generar Ruta
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              mode === 'compare'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Comparar Lenguajes
          </button>
        </div>
      </div>

      {/* MODO SIMPLE */}
      {mode === 'single' && (
        <div>
          <form onSubmit={handleSingleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="input-icon-wrapper flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="input-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Ej: Python, JavaScript, Java, C++..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-glass text-base py-4 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-gradient px-8 py-4 text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span>Generar Ruta</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Popular chips */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {POPULAR_LANGUAGES.map((lang, i) => (
              <button
                key={lang.name}
                onClick={() => { setQuery(lang.name); onSearch(lang.name); }}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm ${
                  i % 2 === 0
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/20'
                    : 'bg-orange-500/10 text-amber-400 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/20'
                }`}
                style={{ animation: `fade-in-up 0.5s ease-out ${(i * 50) + 200}ms both` }}
              >
                <span className="text-sm">{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODO COMPARATIVO */}
      {mode === 'compare' && (
        <div>
          <form onSubmit={handleCompareSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              {/* Input A */}
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">A</span>
                </div>
                <input
                  type="text"
                  placeholder="Primer lenguaje..."
                  value={queryA}
                  onChange={(e) => setQueryA(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors text-base"
                />
              </div>

              {/* VS Badge */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-extrabold text-orange-400 tracking-wider">
                  VS
                </div>
              </div>

              {/* Input B */}
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">B</span>
                </div>
                <input
                  type="text"
                  placeholder="Segundo lenguaje..."
                  value={queryB}
                  onChange={(e) => setQueryB(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-orange-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-colors text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !queryA.trim() || !queryB.trim()}
              className="w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Comparando con IA...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Comparar con IA</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Compare suggestion chips */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <p className="w-full text-center text-xs text-slate-500 mb-1">Comparaciones populares:</p>
            {COMPARE_PAIRS.map((pair, i) => (
              <button
                key={`${pair.a}-${pair.b}`}
                onClick={() => {
                  setQueryA(pair.a);
                  setQueryB(pair.b);
                  if (onCompare) onCompare(pair.a, pair.b);
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                style={{ animation: `fade-in-up 0.5s ease-out ${(i * 60) + 200}ms both` }}
              >
                <span>{pair.iconA}</span>
                <span className="font-bold">{pair.a}</span>
                <span className="text-orange-400 font-black">vs</span>
                <span className="font-bold">{pair.b}</span>
                <span>{pair.iconB}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
