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

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-100">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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

      {/* Popular language chips */}
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
            style={{
              animation: `fade-in-up 0.5s ease-out ${(i * 50) + 200}ms both`
            }}
          >
            <span className="text-sm">{lang.icon}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
