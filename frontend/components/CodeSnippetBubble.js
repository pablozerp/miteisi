'use client';
import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';

/**
 * CodeSnippetBubble — AcademiCode
 * Renderiza snippets de código dentro del chat con syntax highlighting,
 * botón de copiar y opción de abrir en el Playground.
 */

const LANG_COLORS = {
  javascript: { bg: 'rgba(247, 223, 30, 0.10)', border: 'rgba(247, 223, 30, 0.25)', text: '#F7DF1E', label: 'JavaScript' },
  python:     { bg: 'rgba(55, 118, 171, 0.10)', border: 'rgba(55, 118, 171, 0.25)', text: '#5BA0D0', label: 'Python' },
  java:       { bg: 'rgba(237, 139, 0, 0.10)', border: 'rgba(237, 139, 0, 0.25)', text: '#ED8B00', label: 'Java' },
  cpp:        { bg: 'rgba(0, 89, 156, 0.10)', border: 'rgba(0, 89, 156, 0.25)', text: '#659AD2', label: 'C++' },
  c:          { bg: 'rgba(168, 185, 204, 0.10)', border: 'rgba(168, 185, 204, 0.25)', text: '#A8B9CC', label: 'C' },
  go:         { bg: 'rgba(0, 173, 216, 0.10)', border: 'rgba(0, 173, 216, 0.25)', text: '#00ADD8', label: 'Go' },
  typescript: { bg: 'rgba(49, 120, 198, 0.10)', border: 'rgba(49, 120, 198, 0.25)', text: '#3178C6', label: 'TypeScript' },
  rust:       { bg: 'rgba(222, 165, 132, 0.10)', border: 'rgba(222, 165, 132, 0.25)', text: '#DEA584', label: 'Rust' },
  php:        { bg: 'rgba(119, 123, 180, 0.10)', border: 'rgba(119, 123, 180, 0.25)', text: '#777BB4', label: 'PHP' },
  ruby:       { bg: 'rgba(204, 52, 45, 0.10)', border: 'rgba(204, 52, 45, 0.25)', text: '#CC342D', label: 'Ruby' },
};

const DEFAULT_COLORS = { bg: 'rgba(139, 149, 176, 0.10)', border: 'rgba(139, 149, 176, 0.25)', text: '#8B95B0', label: 'Código' };

export default function CodeSnippetBubble({ code, language, isMine = false, isCorrection = false, originalCode = '', onCorrect, isMaximized = false }) {
  const [copied, setCopied] = useState(false);

  const colors = LANG_COLORS[language] || DEFAULT_COLORS;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  const handleOpenInPlayground = (e) => {
    e.stopPropagation();
    // Guardar código en sessionStorage para que el Playground lo recoja
    sessionStorage.setItem('playground_code', code);
    sessionStorage.setItem('playground_language', language || 'javascript');
    window.open('/playground', '_blank');
  };

  // Contar líneas para numeración
  const lines = code.split('\n');
  const lineCount = lines.length;
  const showLineNumbers = lineCount > 1;

  return (
    <div 
      className={`rounded-xl overflow-hidden mt-1 mb-1 max-w-full shadow-lg ${isCorrection ? 'border-[1.5px] border-amber-500/50' : ''}`}
      style={{ 
        background: isCorrection ? 'linear-gradient(145deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))' : colors.bg, 
        border: isCorrection ? undefined : `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      {isCorrection ? (
        <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Corrección Sugerida</span>
          </div>
          <span className="text-[10px] text-amber-500/70 font-semibold">{colors.label}</span>
        </div>
      ) : (
        <div 
          className="flex items-center justify-between px-3 py-1.5"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
        <div className="flex items-center gap-2">
          {/* Dot indicator */}
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.text }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
            {colors.label}
          </span>
          <span className="text-[10px] text-slate-500">
            {lineCount} {lineCount === 1 ? 'línea' : 'líneas'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Open in Playground */}
          <button
            onClick={handleOpenInPlayground}
            className="p-1 rounded-md hover:bg-white/10 transition-colors group"
            title="Abrir en Playground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-white/10 transition-colors group"
            title={copied ? '¡Copiado!' : 'Copiar código'}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {/* Correct Code Button (Only if onCorrect is provided and not my own message and not already a correction) */}
          {onCorrect && !isMine && !isCorrection && (
            <button
              onClick={(e) => { e.stopPropagation(); onCorrect(code, language); }}
              className="p-1 rounded-md hover:bg-emerald-500/10 transition-colors group flex items-center gap-1 text-[10px] text-emerald-400 border border-emerald-400/30 ml-2 px-2"
              title="Corregir este código"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Corregir
            </button>
          )}
        </div>
      </div>
      )}

      {/* Code Content */}
      <div className={`overflow-x-auto ${isMaximized ? 'max-h-[600px]' : 'max-h-[450px]'} overflow-y-auto`}>
        {isCorrection ? (
          <div style={{ height: isMaximized ? '450px' : '350px' }} className="w-full relative">
            <div className="absolute inset-0 pointer-events-none border-t border-b border-amber-500/10 z-10" />
            <DiffEditor
              height="100%"
              language={language || 'javascript'}
              original={originalCode}
              modified={code}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                renderSideBySide: isMaximized, // Side-by-side cuando está maximizado
                fontSize: isMaximized ? 14 : 12, // Fuente más grande maximizado
                lineHeight: isMaximized ? 22 : 20,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        ) : (
          <pre className="p-3 text-xs leading-relaxed">
            <code className="font-mono">
              {lines.map((line, i) => (
                <div key={i} className="flex hover:bg-white/5 transition-colors rounded-sm">
                  {showLineNumbers && (
                    <span className="select-none text-slate-600 text-right pr-3 w-8 shrink-0 inline-block">
                      {i + 1}
                    </span>
                  )}
                  <span className="text-slate-200 whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
