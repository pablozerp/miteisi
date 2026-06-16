'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import { executeCode } from '@/lib/api';

/**
 * Playground Page — AcademiCode
 * Página completa para escribir, ejecutar y compartir código.
 */

const EXECUTION_HISTORY_KEY = 'academicode_exec_history';
const MAX_HISTORY = 15;

export default function PlaygroundPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [initialCode, setInitialCode] = useState('');
  const [initialLanguage, setInitialLanguage] = useState('javascript');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (!token) { router.push('/login'); return; }
    setUserName(name || 'Estudiante');

    // Cargar historial de ejecuciones
    try {
      const saved = JSON.parse(localStorage.getItem(EXECUTION_HISTORY_KEY) || '[]');
      setHistory(saved);
    } catch { /* ignore */ }

    // Verificar si hay código precargado del chat
    const preloadedCode = sessionStorage.getItem('playground_code');
    const preloadedLang = sessionStorage.getItem('playground_language');
    if (preloadedCode) {
      setInitialCode(preloadedCode);
      setInitialLanguage(preloadedLang || 'javascript');
      sessionStorage.removeItem('playground_code');
      sessionStorage.removeItem('playground_language');
    }
  }, [router]);

  const handleExecute = useCallback(async (code, language, stdin) => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeCode(code, language, stdin);
      setExecutionResult(result);

      // Guardar en historial
      const entry = {
        id: Date.now(),
        code: code.substring(0, 500), // Truncar para localStorage
        language,
        success: result.success,
        output: (result.output || '').substring(0, 300),
        error: (result.error || '').substring(0, 300),
        executionTime: result.executionTime,
        timestamp: new Date().toISOString(),
      };

      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY);
        try { localStorage.setItem(EXECUTION_HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    } catch (err) {
      setExecutionResult({
        success: false,
        output: '',
        error: err.response?.data?.error || err.message || 'Error al ejecutar el código.',
        executionTime: 0,
        language,
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(EXECUTION_HISTORY_KEY);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden bg-transparent">
      {/* Decorative Orbs */}
      <div className="bg-orb w-[700px] h-[700px] bg-emerald-600/8 top-[-200px] right-[-100px]" />
      <div className="bg-orb w-[500px] h-[500px] bg-blue-600/8 bottom-[-100px] left-[-100px]" />

      <Navbar userName={userName} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Editor de Código</h2>
                <p className="text-slate-400 text-sm">Escribe, ejecuta y experimenta con código en tiempo real</p>
              </div>
            </div>

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                showHistory 
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial ({history.length})
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className={`flex gap-6 animate-fade-in-up delay-100 ${showHistory ? '' : ''}`}>
          {/* Editor Panel */}
          <div className={`flex-1 transition-all duration-300 ${showHistory ? 'w-2/3' : 'w-full'}`} style={{ height: 'calc(100vh - 220px)' }}>
            <CodeEditor
              onExecute={handleExecute}
              isExecuting={isExecuting}
              executionResult={executionResult}
              initialCode={initialCode}
              initialLanguage={initialLanguage}
            />
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="w-80 shrink-0 glass-card p-4 overflow-hidden flex flex-col animate-fade-in-up" style={{ height: 'calc(100vh - 220px)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Historial de Ejecuciones</h3>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs">Aún no has ejecutado código</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div 
                      key={entry.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                        entry.success 
                          ? 'border-emerald-500/20 bg-emerald-500/5' 
                          : 'border-red-500/20 bg-red-500/5'
                      }`}
                      onClick={() => {
                        setInitialCode(entry.code);
                        setInitialLanguage(entry.language);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ 
                          color: entry.success ? '#34D399' : '#F87171' 
                        }}>
                          {entry.success ? ' Exitoso' : ' Error'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {entry.executionTime}ms
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate mb-1">
                        {entry.language}
                      </p>
                      <pre className="text-[10px] text-slate-500 font-mono line-clamp-2 whitespace-pre-wrap">
                        {entry.output || entry.error || '(sin output)'}
                      </pre>
                      <span className="text-[9px] text-slate-600 mt-1 block">
                        {new Date(entry.timestamp).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcut tip */}
        <div className="mt-4 text-center animate-fade-in-up delay-200">
          <p className="text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono text-[10px]">Ctrl</kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono text-[10px]">Enter</kbd>
            {' para ejecutar'}
          </p>
        </div>
      </main>
    </div>
  );
}
