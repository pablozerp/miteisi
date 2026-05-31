'use client';
import { useState } from 'react';

const POPULAR_LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'TypeScript'];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Ej: Python, JavaScript, Java, C++..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-glass flex-1 text-base"
          style={{ padding: '1rem 1.25rem' }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-gradient px-6 text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Generando...' : '🔍 Generar Ruta'}
        </button>
      </form>

      {/* Popular language chips */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {POPULAR_LANGUAGES.map((lang, i) => (
          <button
            key={lang}
            onClick={() => { setQuery(lang); onSearch(lang); }}
            disabled={loading}
            className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{
              background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(209, 105, 0, 0.12)',
              color: i % 2 === 0 ? '#3B82F6' : '#D16900',
              border: `1px solid ${i % 2 === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(209, 105, 0, 0.2)'}`,
            }}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
