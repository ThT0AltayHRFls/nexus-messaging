import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from '@/lib/api';
import { useAuth } from './AuthContext';
import { scheduleLocalNotification } from './NotificationContext';
import type { AppNotification } from '@/lib/types';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  // Expose a way for other components to listen to socket events
  on: (event: string, cb: (...args: any[]) => void) => void;
  off: (event: string, cb: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  on: () => {},
  off: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const on = (event: string, cb: (...args: any[]) => void) => {
    socketRef.current?.on(event, cb);
  };

  const off = (event: string, cb: (...args: any[]) => void) => {
    socketRef.current?.off(event, cb);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const baseUrl = getBaseUrl();
    const socket = io(baseUrl, {
      path: '/api/socket.io',
      transports: ['polling', 'websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (_err) => {
      setIsConnected(false);
    });

    // ── Real-time push notifications via socket ──────────────────────────

    // New message from someone
    socket.on('new_message', (data: {
      conversationId: number;
      senderName: string;
      senderId: number;
      content?: string;
      type?: string;
    }) => {
      if (data.senderId === user?.id) return; // own message
      const body = data.content || (data.type === 'image' ? '📷 Fotoğraf' : data.type === 'video' ? '🎥 Video' : '📎 Dosya');
      scheduleLocalNotification({
        title: data.senderName,
        body,
        data: {
          type: 'message',
          conversationId: data.conversationId,
          senderId: data.senderId,
        },
        categoryIdentifier: 'MESSAGE',
        channelId: 'messages',
      });
    });

    // Someone liked your video
    socket.on('video_liked', (data: {
      videoId: number;
      likerName: string;
      videoTitle?: string;
    }) => {
      scheduleLocalNotification({
        title: 'Video beğenildi',
        body: `${data.likerName} videonuzu beğendi${data.videoTitle ? `: ${data.videoTitle}` : ''}`,
        data: {
          type: 'video_like',
          videoId: data.videoId,
        },
        categoryIdentifier: 'VIDEO',
        channelId: 'videos',
      });
    });

    // Someone hearted your comment
    socket.on('comment_hearted', (data: {
      videoId: number;
      hearterName: string;
    }) => {
      scheduleLocalNotification({
        title: 'Yorumunuz kalp aldı 💜',
        body: `${data.hearterName} yorumunuza kalp bıraktı`,
        data: {
          type: 'comment_heart',
          videoId: data.videoId,
        },
        channelId: 'videos',
      });
    });

    // Many hearts on your comment
    socket.on('many_hearts', (data: {
      videoId: number;
      count: number;
    }) => {
      scheduleLocalNotification({
        title: `${data.count}+ kullanıcı yorumunuza kalp bıraktı!`,
        body: 'Yorumunuz çok beğenildi',
        data: {
          type: 'many_hearts',
          videoId: data.videoId,
        },
        channelId: 'videos',
      });
    });

    // Someone you follow posted a video
    socket.on('followed_user_video', (data: {
      userId: number;
      userName: string;
      videoId: number;
      videoTitle?: string;
    }) => {
      scheduleLocalNotification({
        title: `${data.userName} yeni bir video paylaştı`,
        body: data.videoTitle || 'Yeni video',
        data: {
          type: 'new_video',
          videoId: data.videoId,
          userId: data.userId,
        },
        categoryIdentifier: 'VIDEO',
        channelId: 'videos',
      });
    });

    // Someone liked your comment
    socket.on('comment_liked', (data: {
      videoId: number;
      likerName: string;
    }) => {
      scheduleLocalNotification({
        title: 'Yorumunuz beğenildi',
        body: `${data.likerName} yorumunuzu beğendi`,
        data: {
          type: 'comment_like',
          videoId: data.videoId,
        },
        channelId: 'videos',
      });
    });

    // New follower
    socket.on('new_follower', (data: {
      followerId: number;
      followerName: string;
    }) => {
      scheduleLocalNotification({
        title: 'Yeni takipçi',
        body: `${data.followerName} sizi takip etmeye başladı`,
        data: {
          type: 'follow',
          userId: data.followerId,
        },
        channelId: 'default',
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
