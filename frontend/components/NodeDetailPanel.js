/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';

const levelColors = {
  'Básico': {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    glow: 'shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]',
    dot: 'bg-green-400',
  },
  'Intermedio': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]',
    dot: 'bg-orange-400',
  },
  'Avanzado': {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]',
    dot: 'bg-red-400',
  },
};

// Extrae el video ID de YouTube para mostrar thumbnail
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
};

function ResourceCard({ href, title, summary, footer, color = 'blue', delay = 0 }) {
  const colors = {
    blue: 'hover:border-blue-500/40 hover:bg-blue-500/5',
    orange: 'hover:border-orange-500/40 hover:bg-orange-500/5',
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-3 rounded-xl bg-white/3 border border-white/8 transition-all duration-200 ${colors[color]}`}
      style={{ animation: `fade-in-up 0.4s ease-out ${delay}ms both` }}
    >
      <p className={`text-sm font-semibold line-clamp-2 transition-colors ${color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' : 'text-orange-400 group-hover:text-orange-300'}`}>
        {title}
      </p>
      {summary && (
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {summary}
        </p>
      )}
      {footer && (
        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-wider font-semibold">
          {footer}
        </p>
      )}
    </a>
  );
}

export default function NodeDetailPanel({ node, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('docs'); // 'docs' | 'videos' | 'topics'

  useEffect(() => {
    if (node) {
      setActiveTab('docs');
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [node]);

  if (!node && !mounted) return null;

  const data = node?.data || node;
  if (!data) return null;

  const style = levelColors[data.level] || levelColors['Básico'];
  const hasDocs = data.documentation?.length > 0;
  const hasVideos = data.videos?.length > 0;
  const hasTopics = data.topics?.length > 0;

  return (
    <div
      className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-[#0d1526]/97 backdrop-blur-2xl border-l border-white/8 z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${style.glow} ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/8 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {data.level}
              </span>
              {/* Indicador de lenguaje si es nodo comparativo */}
              {data.lang && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                  {data.lang}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {data.title}
            </h2>
          </div>
          <button
            onClick={() => {
              setMounted(false);
              setTimeout(onClose, 300);
            }}
            className="w-8 h-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-sm text-slate-400 leading-relaxed mt-3">{data.description}</p>
        )}

        {/* Quick stats row */}
        <div className="flex items-center gap-3 mt-4">
          {hasTopics && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <span>📚</span>
              <span className="font-semibold">{data.topics.length} temas</span>
            </div>
          )}
          {hasDocs && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <span>📄</span>
              <span className="font-semibold">{data.documentation.length} docs</span>
            </div>
          )}
          {hasVideos && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <span>🎬</span>
              <span className="font-semibold">{data.videos.length} videos</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-white/8 shrink-0 bg-black/10">
        {hasTopics && (
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'topics' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Temas
          </button>
        )}
        {hasDocs && (
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Docs
          </button>
        )}
        {hasVideos && (
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'text-white border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Videos
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* TOPICS tab */}
        {activeTab === 'topics' && hasTopics && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 mb-3">Conceptos que aprenderás en esta etapa:</p>
            <div className="space-y-3">
              {data.topics.map((t, i) => {
                const name = typeof t === 'string' ? t : t.name;
                const description = typeof t === 'string' ? null : t.description;

                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors"
                    style={{ animation: `fade-in-up 0.35s ease-out ${i * 40}ms both` }}
                  >
                    <h4 className="text-sm font-bold text-blue-300 mb-1">{name}</h4>
                    {description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DOCS tab */}
        {activeTab === 'docs' && hasDocs && (
          <div className="space-y-3">
            {data.documentation.map((doc, i) => {
              const isDirectLink = doc.url?.startsWith('http') && !doc.url.includes('google.com/search');
              const href = isDirectLink ? doc.url : `https://www.google.com/search?btnI=1&q=${encodeURIComponent(doc.url)}`;
              const domain = (() => {
                try { return new URL(href).hostname; } catch { return 'Documentación'; }
              })();

              return (
                <ResourceCard
                  key={i}
                  href={href}
                  title={doc.title}
                  summary={doc.summary}
                  footer={
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {domain}
                    </>
                  }
                  color="blue"
                  delay={i * 50}
                />
              );
            })}
          </div>
        )}

        {/* VIDEOS tab */}
        {activeTab === 'videos' && hasVideos && (
          <div className="space-y-4">
            {data.videos.map((v, i) => {
              const ytId = getYouTubeId(v.url);
              return (
                <a
                  key={i}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-white/8 bg-white/3 overflow-hidden hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-200"
                  style={{ animation: `fade-in-up 0.4s ease-out ${i * 60}ms both` }}
                >
                  {/* YouTube thumbnail */}
                  {ytId && (
                    <div className="relative w-full h-32 bg-black/30 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <svg className="h-5 w-5 text-white ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-orange-400 font-semibold line-clamp-2 group-hover:text-orange-300 transition-colors">
                      {v.title}
                    </p>
                    {v.summary && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{v.summary}</p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-wider font-semibold">
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      Ver en YouTube
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Fallback si no hay contenido en pestaña */}
        {((activeTab === 'docs' && !hasDocs) || (activeTab === 'videos' && !hasVideos) || (activeTab === 'topics' && !hasTopics)) && (
          <div className="text-center py-10 text-slate-500">
            <span className="text-3xl mb-3 block">🔍</span>
            <p className="text-sm">No hay recursos disponibles en esta sección.</p>
          </div>
        )}
      </div>
    </div>
  );
}
