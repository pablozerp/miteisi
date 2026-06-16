'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * CodeEditor — AcademiCode
 * Editor de código integrado con Monaco Editor (VS Code engine).
 * Soporta múltiples lenguajes, ejecución en sandbox, y compartir en chat.
 */

// Templates de código por lenguaje
const CODE_TEMPLATES = {
  javascript: `//  JavaScript — AcademiCode Playground
console.log("¡Hola, AcademiCode!");

// Prueba con variables
const nombre = "Estudiante UNERG";
const año = new Date().getFullYear();
console.log(\`Bienvenido \${nombre}, año \${año}\`);
`,
  python: `#  Python — AcademiCode Playground
print("¡Hola, AcademiCode!")

# Prueba con variables
nombre = "Estudiante UNERG"
año = 2026
print(f"Bienvenido {nombre}, año {año}")
`,
  java: `//  Java — AcademiCode Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("¡Hola, AcademiCode!");
        
        String nombre = "Estudiante UNERG";
        int año = 2026;
        System.out.println("Bienvenido " + nombre + ", año " + año);
    }
}
`,
  cpp: `//  C++ — AcademiCode Playground
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "¡Hola, AcademiCode!" << endl;
    
    string nombre = "Estudiante UNERG";
    int anio = 2026;
    cout << "Bienvenido " << nombre << ", año " << anio << endl;
    
    return 0;
}
`,
  go: `//  Go — AcademiCode Playground
package main

import "fmt"

func main() {
    fmt.Println("¡Hola, AcademiCode!")
    
    nombre := "Estudiante UNERG"
    año := 2026
    fmt.Printf("Bienvenido %s, año %d\\n", nombre, año)
}
`,
  typescript: `//  TypeScript — AcademiCode Playground
const greeting: string = "¡Hola, AcademiCode!";
console.log(greeting);

interface Student {
  name: string;
  year: number;
}

const student: Student = {
  name: "Estudiante UNERG",
  year: 2026
};

console.log(\`Bienvenido \${student.name}, año \${student.year}\`);
`,
  c: `/*  C — AcademiCode Playground */
#include <stdio.h>

int main() {
    printf("¡Hola, AcademiCode!\\n");
    
    char nombre[] = "Estudiante UNERG";
    int anio = 2026;
    printf("Bienvenido %s, año %d\\n", nombre, anio);
    
    return 0;
}
`,
  rust: `//  Rust — AcademiCode Playground
fn main() {
    println!("¡Hola, AcademiCode!");
    
    let nombre = "Estudiante UNERG";
    let año = 2026;
    println!("Bienvenido {}, año {}", nombre, año);
}
`,
  php: `<?php
//  PHP — AcademiCode Playground
echo "¡Hola, AcademiCode!\\n";

$nombre = "Estudiante UNERG";
$año = 2026;
echo "Bienvenido $nombre, año $año\\n";
?>
`,
  ruby: `#  Ruby — AcademiCode Playground
puts "¡Hola, AcademiCode!"

nombre = "Estudiante UNERG"
año = 2026
puts "Bienvenido #{nombre}, año #{año}"
`,
};

const LANGUAGE_LABELS = {
  javascript: { name: 'JavaScript', icon: '🟨', color: '#F7DF1E' },
  python:     { name: 'Python',     icon: '', color: '#3776AB' },
  java:       { name: 'Java',       icon: '', color: '#ED8B00' },
  cpp:        { name: 'C++',        icon: '', color: '#00599C' },
  c:          { name: 'C',          icon: '', color: '#A8B9CC' },
  go:         { name: 'Go',         icon: '', color: '#00ADD8' },
  typescript: { name: 'TypeScript', icon: '', color: '#3178C6' },
  rust:       { name: 'Rust',       icon: '', color: '#DEA584' },
  php:        { name: 'PHP',        icon: '', color: '#777BB4' },
  ruby:       { name: 'Ruby',       icon: '', color: '#CC342D' },
};

// Mapeo de lenguajes a modos de Monaco
const MONACO_LANGUAGES = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  typescript: 'typescript',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
};

export default function CodeEditor({ 
  onExecute,          // Función para ejecutar código: (code, language) => Promise<result>
  onShareToChat,      // Función para compartir en chat: (code, language) => void
  isExecuting = false,
  executionResult = null,
  initialCode = '',
  initialLanguage = 'javascript',
  compact = false,    // Modo compacto para modales
}) {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || CODE_TEMPLATES[initialLanguage] || '');
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cargar Monaco Editor dinámicamente
  const MonacoEditor = useRef(null);
  
  useEffect(() => {
    import('@monaco-editor/react').then((mod) => {
      MonacoEditor.current = mod.default;
      setMonacoLoaded(true);
    }).catch(() => {
      console.error('Error cargando Monaco Editor');
    });
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    setShowLangDropdown(false);
    // Solo cambiar template si el código actual es un template
    const currentIsTemplate = Object.values(CODE_TEMPLATES).some(t => t.trim() === code.trim());
    if (currentIsTemplate || !code.trim()) {
      setCode(CODE_TEMPLATES[newLang] || '');
    }
  }, [code]);

  const handleRun = useCallback(() => {
    if (onExecute && !isExecuting) {
      onExecute(code, language, stdin);
    }
  }, [code, language, stdin, onExecute, isExecuting]);

  const handleShare = useCallback(() => {
    if (onShareToChat && code.trim()) {
      onShareToChat(code, language);
    }
  }, [code, language, onShareToChat]);

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configurar tema personalizado AcademiCode
    monaco.editor.defineTheme('academicode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7C8CFF' },
        { token: 'string', foreground: '9ECBFF' },
        { token: 'number', foreground: 'F9AE58' },
        { token: 'type', foreground: '79B8FF' },
        { token: 'function', foreground: 'B392F0' },
        { token: 'variable', foreground: 'E1E4E8' },
      ],
      colors: {
        'editor.background': '#0D1525',
        'editor.foreground': '#E1E4E8',
        'editor.lineHighlightBackground': '#1B2640',
        'editor.selectionBackground': '#3B82F640',
        'editorCursor.foreground': '#3B82F6',
        'editor.inactiveSelectionBackground': '#3B82F620',
        'editorLineNumber.foreground': '#4A5568',
        'editorLineNumber.activeForeground': '#8B95B0',
        'editorGutter.background': '#0B1326',
        'editorWidget.background': '#131B2E',
        'editorWidget.border': '#1E2A42',
        'input.background': '#0D1525',
        'input.border': '#1E2A42',
        'dropdown.background': '#131B2E',
        'dropdown.border': '#1E2A42',
        'list.hoverBackground': '#1B2640',
        'list.activeSelectionBackground': '#3B82F630',
        'scrollbarSlider.background': '#222A3D80',
        'scrollbarSlider.hoverBackground': '#3B82F680',
      },
    });

    monaco.editor.setTheme('academicode-dark');

    // Atajo Ctrl+Enter para ejecutar
    editor.addAction({
      id: 'run-code',
      label: 'Ejecutar Código',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRun(),
    });
  }, [handleRun]);

  const langInfo = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.javascript;

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0B1326] ${compact ? '' : 'h-full'}`}>
      {/* ═══ TOOLBAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#131B2E] to-[#0F1829] border-b border-white/10">
        {/* Left: Language Selector */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/8 transition-all text-sm font-medium"
            >
              <span>{langInfo.icon}</span>
              <span className="text-white">{langInfo.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-[#131B2E] border border-white/10 shadow-2xl shadow-black/50 z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
                {Object.entries(LANGUAGE_LABELS).map(([id, info]) => (
                  <button
                    key={id}
                    onClick={() => handleLanguageChange(id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                      language === id 
                        ? 'bg-blue-500/15 text-white' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    <span className="font-medium">{info.name}</span>
                    {language === id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stdin Toggle */}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showStdin 
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
            title="Input (stdin)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            stdin
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Share to Chat */}
          {onShareToChat && (
            <button
              onClick={handleShare}
              disabled={!code.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Compartir en Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir
            </button>
          )}

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isExecuting || !code.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
            title="Ejecutar (Ctrl+Enter)"
          >
            {isExecuting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Ejecutando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Ejecutar
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══ STDIN INPUT ═══ */}
      {showStdin && (
        <div className="px-4 py-2 bg-[#0D1525] border-b border-white/5">
          <label className="text-xs text-slate-400 font-medium mb-1 block">Input (stdin):</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Escribe el input que recibirá tu programa..."
            className="w-full bg-[#131B2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/30 resize-none"
            rows={2}
          />
        </div>
      )}

      {/* ═══ EDITOR ═══ */}
      <div className={`flex-1 ${compact ? 'min-h-[300px]' : 'min-h-[400px]'}`}>
        {monacoLoaded && MonacoEditor.current ? (
          <MonacoEditor.current
            height="100%"
            language={MONACO_LANGUAGES[language] || 'plaintext'}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            theme="academicode-dark"
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontLigatures: true,
              minimap: { enabled: !compact },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
              lineNumbersMinChars: 3,
              folding: true,
              bracketPairColorization: { enabled: true },
              suggest: { showWords: false },
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-400">
                <svg className="animate-spin h-8 w-8 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando editor...
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <svg className="animate-spin h-8 w-8 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cargando editor...
          </div>
        )}
      </div>

      {/* ═══ OUTPUT PANEL ═══ */}
      {executionResult && (
        <div className="border-t border-white/10 bg-[#0A0F1E]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${executionResult.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-bold ${executionResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {executionResult.success ? 'Ejecución Exitosa' : 'Error'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {executionResult.executionTime}ms • {executionResult.language}
            </span>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto">
            {executionResult.output && (
              <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {executionResult.output}
              </pre>
            )}
            {executionResult.error && (
              <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap break-words leading-relaxed mt-1">
                {executionResult.error}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { CODE_TEMPLATES, LANGUAGE_LABELS };
