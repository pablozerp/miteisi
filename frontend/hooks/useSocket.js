import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:4000';

export const useSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Inicializar socket
    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      // Unirse a la sala personal usando el userId
      socketRef.current.emit('join', userId);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  const sendMessage = (receiverId, content, imageUrl = null, codeContent = null, codeLanguage = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', {
        senderId: userId,
        receiverId,
        content,
        imageUrl,
        codeContent,
        codeLanguage
      });
    }
  };

  const subscribeToMessages = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('receive_message', callback);
    }
  };

  const unsubscribeFromMessages = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('receive_message', callback);
    }
  };

  return { isConnected, sendMessage, subscribeToMessages, unsubscribeFromMessages };
};
