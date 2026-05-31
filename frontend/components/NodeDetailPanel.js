'use client';
import { useEffect, useState } from 'react';

const levelColors = {
  'Básico': {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30'
  },
  'Intermedio': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30'
  },
  'Avanzado': {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30'
  },
};

export default function NodeDetailPanel({ node, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (node) {
      // Small delay to allow the enter animation
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [node]);

  if (!node && !mounted) return null;

  const data = node?.data || node;
  if (!data) return null;

  const style = levelColors[data.level] || levelColors['Básico'];

  return (
    <div 
      className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-[#131b2e]/95 backdrop-blur-2xl border-l border-white/10 z-50 shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border mb-3 ${style.bg} ${style.text} ${style.border}`}>
              {data.level}
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              {data.title}
            </h2>
          </div>
          <button 
            onClick={() => {
              setMounted(false);
              setTimeout(onClose, 300);
            }}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-[#8b95b0] text-sm leading-relaxed mb-6">
          {data.description}
        </p>

        {/* Topics */}
        {data.topics?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Temas Clave</h3>
            <div className="flex flex-wrap gap-2">
              {data.topics.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                  style={{ animation: `fade-in-up 0.4s ease-out ${(i * 50) + 100}ms both` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr className="border-white/5 my-6" />

        {/* Documentation */}
        {data.documentation?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Documentación Oficial</h3>
            </div>
            
            <div className="space-y-3">
              {data.documentation.map((doc, i) => {
                const isDirectLink = doc.url?.startsWith('http') && !doc.url.includes('google.com/search');
                const href = isDirectLink ? doc.url : `https://www.google.com/search?btnI=1&q=${encodeURIComponent(doc.url)}`;
                const domain = isDirectLink ? new URL(doc.url).hostname : 'Buscar en Google';

                return (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all"
                    style={{ animation: `fade-in-up 0.4s ease-out ${(i * 50) + 200}ms both` }}
                  >
                    <p className="text-sm text-blue-400 font-medium group-hover:text-blue-300 truncate">
                      {doc.title}
                    </p>
                    {doc.summary && (
                      <p className="text-xs text-slate-400 mt-1.5 mb-2 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {domain}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos */}
        {data.videos?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Tutoriales en Video</h3>
            </div>
            
            <div className="space-y-3">
              {data.videos.map((v, i) => (
                <a
                  key={i}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all"
                  style={{ animation: `fade-in-up 0.4s ease-out ${(i * 50) + 300}ms both` }}
                >
                  <p className="text-sm text-orange-400 font-medium group-hover:text-orange-300 line-clamp-2">
                    {v.title}
                  </p>
                  {v.summary && (
                    <p className="text-xs text-slate-400 mt-1.5 mb-2 line-clamp-2 leading-relaxed">
                      {v.summary}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Ver en YouTube
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
