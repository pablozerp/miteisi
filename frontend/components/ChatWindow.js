/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import CodeSnippetBubble from './CodeSnippetBubble';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Lenguajes disponibles para código en chat
const CHAT_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'python',     label: 'Python',     icon: '' },
  { id: 'java',       label: 'Java',       icon: '' },
  { id: 'cpp',        label: 'C++',        icon: '' },
  { id: 'c',          label: 'C',          icon: '' },
  { id: 'go',         label: 'Go',         icon: '' },
  { id: 'typescript', label: 'TypeScript', icon: '' },
  { id: 'rust',       label: 'Rust',       icon: '' },
  { id: 'php',        label: 'PHP',        icon: '' },
  { id: 'ruby',       label: 'Ruby',       icon: '' },
];

export default function ChatWindow({ currentUserId, otherUser, onClose }) {
  const { isConnected, sendMessage, subscribeToMessages, unsubscribeFromMessages } = useSocket(currentUserId);
  const [currentUserRole, setCurrentUserRole] = useState('USER');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Código en chat
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeText, setCodeText] = useState('');
  const [codeLang, setCodeLang] = useState('javascript');
  const [correctingState, setCorrectingState] = useState({ active: false, originalCode: '', language: '' });
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const codeTextareaRef = useRef(null);

  // Cargar historial
  useEffect(() => {
    if (!currentUserId || !otherUser?.id) return;
    
    // Obtener el rol del usuario actual desde el token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserRole(payload.role);
      } catch (e) {}
    }
    
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/chat/${otherUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Error loading chat history', err);
      }
    };
    fetchHistory();
  }, [currentUserId, otherUser]);

  // Escuchar mensajes nuevos
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (
        (msg.senderId === currentUserId && msg.receiverId === otherUser.id) ||
        (msg.senderId === otherUser.id && msg.receiverId === currentUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    subscribeToMessages(handleNewMessage);
    return () => {
      unsubscribeFromMessages(handleNewMessage);
    };
  }, [currentUserId, otherUser, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en textarea de código cuando se abre
  useEffect(() => {
    if (showCodeInput && codeTextareaRef.current) {
      codeTextareaRef.current.focus();
    }
  }, [showCodeInput]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage && !codeText.trim()) || !isConnected || isUploading) return;
    
    setIsUploading(true);
    let imageUrl = null;

    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_BASE}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        imageUrl = res.data.imageUrl;
      } catch (err) {
        console.error('Error al subir imagen', err);
        setIsUploading(false);
        return;
      }
    }

    // Enviar mensaje con posible código adjunto
    const codeContent = codeText.trim() || null;
    const codeLanguage = codeContent ? codeLang : null;

    sendMessage(otherUser.id, inputText, imageUrl, codeContent, codeLanguage);
    setInputText('');
    setSelectedImage(null);
    setCodeText('');
    setShowCodeInput(false);
    setIsUploading(false);
  };

  const handleSendCodeOnly = () => {
    if (!codeText.trim() || !isConnected) return;
    sendMessage(otherUser.id, '', null, codeText.trim(), codeLang, correctingState.active, correctingState.originalCode);
    setCodeText('');
    setShowCodeInput(false);
    setCorrectingState({ active: false, originalCode: '', language: '' });
  };

  const handleCorrectCode = (code, lang) => {
    setCorrectingState({ active: true, originalCode: code, language: lang });
    setCodeText(code);
    setCodeLang(lang);
    setShowCodeInput(true);
  };

  if (!otherUser) return null;

  return (
    <div 
      className={`fixed ${isMaximized ? 'inset-4 md:inset-10 z-[100] rounded-2xl' : 'bottom-0 right-4 w-80 md:w-96 rounded-t-2xl z-50'} glass-card shadow-2xl flex flex-col border border-white/10 transition-all duration-300`} 
      style={{ height: isMaximized ? 'auto' : '500px', maxHeight: isMaximized ? '100%' : '80vh' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
              {otherUser.firstName?.charAt(0) || otherUser.name?.charAt(0) || 'U'}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b1326] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{otherUser.firstName} {otherUser.lastName}</h3>
            <p className="text-xs text-slate-400">{otherUser.role === 'SUPERADMIN' ? 'Super Administrador' : (otherUser.role === 'ADMIN' ? 'Docente' : 'Estudiante')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-slate-400 hover:text-white transition-colors p-1" title={isMaximized ? "Minimizar" : "Maximizar"}>
            {isMaximized ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3h-3m3 -3l-4 4m13 -4v3h3m-3 -3l4 4m-13 13v-3h-3m3 3l-4 -4m13 4v-3h3m-3 3l4 -4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b1326]/50">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`${msg.codeContent ? 'w-[98%] max-w-[98%]' : 'max-w-[80%]'} rounded-2xl px-4 py-3 shadow-lg ${isMine ? 'bg-blue-600/90 text-white rounded-br-sm' : 'bg-[#131B2E]/90 text-slate-200 rounded-bl-sm border border-white/10'}`}>
                {msg.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={`${API_BASE.replace('/api', '')}${msg.imageUrl}`} 
                    alt="Adjunto" 
                    className="max-w-full rounded-xl mb-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                    style={{ maxHeight: '200px', objectFit: 'cover' }} 
                    onClick={() => setFullscreenImage(`${API_BASE.replace('/api', '')}${msg.imageUrl}`)}
                  />
                )}
                {msg.content && <p className="text-sm">{msg.content}</p>}
                
                {/* ═══ CODE SNIPPET ═══ */}
                {msg.codeContent && (
                  <CodeSnippetBubble 
                    code={msg.codeContent} 
                    language={msg.codeLanguage || 'javascript'} 
                    isMine={isMine}
                    isCorrection={msg.isCorrection}
                    originalCode={msg.originalCodeContent}
                    onCorrect={(currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN') ? handleCorrectCode : null}
                    isMaximized={isMaximized}
                  />
                )}

                <span className="text-[10px] opacity-60 mt-1 block text-right">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ═══ CODE INPUT MODAL ═══ */}
      {showCodeInput && (
        <div className="border-t border-white/10 bg-[#0A0F1E] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-xs font-bold text-white">
                {correctingState.active ? 'Corrigiendo Código' : 'Adjuntar Código'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="text-[10px] bg-white/5 border border-white/10 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500/30 appearance-none cursor-pointer"
              >
                {CHAT_LANGUAGES.map(l => (
                  <option key={l.id} value={l.id} className="bg-[#131B2E]">
                    {l.icon} {l.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { setShowCodeInput(false); setCodeText(''); setCorrectingState({ active: false, originalCode: '', language: '' }); }}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <textarea
            ref={codeTextareaRef}
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            placeholder="Pega o escribe tu código aquí..."
            className="w-full bg-[#131B2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-emerald-300 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/30 resize-none shadow-inner"
            rows={isMaximized ? 12 : 8}
            spellCheck={false}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSendCodeOnly}
              disabled={!codeText.trim() || !isConnected}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                correctingState.active 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              {correctingState.active ? 'Enviar Corrección' : 'Enviar Código'}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-black/20 flex flex-col gap-2">
        {selectedImage && (
          <div className="relative self-start inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-16 rounded-md object-cover border border-white/20 shadow-lg" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs hover:bg-red-600 shadow-md"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImage(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          {/* Image attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-white transition-colors p-2"
            disabled={!isConnected || isUploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Code attach button */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`transition-colors p-2 ${showCodeInput ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'}`}
            disabled={!isConnected || isUploading}
            title="Adjuntar código"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
            disabled={!isConnected || isUploading}
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage && !codeText.trim()) || !isConnected || isUploading}
            className="btn-gradient w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            {isUploading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={fullscreenImage} 
              alt="Vista completa" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
