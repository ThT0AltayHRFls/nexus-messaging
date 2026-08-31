import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import type { AppNotification } from '@/lib/types';

// Show notifications when app is in foreground too
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerNotificationCategories() {
  try {
    // Only register on Android platform
    if (Platform.OS !== 'android') return;
    
    try {
      await Notifications.setNotificationCategoryAsync('MESSAGE', [
        {
          identifier: 'REPLY',
          buttonTitle: 'Yanıtla',
          textInput: {
            submitButtonTitle: 'Gönder',
            placeholder: 'Mesajınızı yazın...',
          },
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'OPEN',
          buttonTitle: 'Aç',
          options: { opensAppToForeground: true },
        },
      ]);
    } catch (e) {
      console.warn('Failed to set MESSAGE category:', e);
    }

    try {
      await Notifications.setNotificationCategoryAsync('VIDEO', [
        {
          identifier: 'LIKE_VIDEO',
          buttonTitle: 'Beğen',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'OPEN_VIDEO',
          buttonTitle: 'Videoyu Gör',
          options: { opensAppToForeground: true },
        },
      ]);
    } catch (e) {
      console.warn('Failed to set VIDEO category:', e);
    }
  } catch (error) {
    console.warn('Error registering notification categories:', error);
  }
}

interface NotificationContextValue {
  expoPushToken: string | null;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  addNotification: (n: AppNotification) => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  expoPushToken: null,
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  addNotification: () => {},
  clearNotification: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (n: AppNotification) => {
    setNotifications((prev) => {
      if (prev.find((x) => x.id === n.id)) return prev;
      return [n, ...prev];
    });
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    registerNotificationCategories();
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        addNotification({
          id: notification.request.identifier,
          type: (data?.type as AppNotification['type']) || 'message',
          title: title || '',
          body: body || '',
          data: data as Record<string, any>,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    );

    // Notification tap / action response listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { notification, actionIdentifier, userText } = response;
        const data = notification.request.content.data as Record<string, any>;

        if (actionIdentifier === 'REPLY' && userText && data?.conversationId) {
          router.push(`/conversation/${data.conversationId}` as any);
        } else if (actionIdentifier === 'LIKE_VIDEO' && data?.videoId) {
          router.push('/(tabs)/feed' as any);
        } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          // Tap on notification body → navigate
          if (data?.conversationId) {
            router.push(`/conversation/${data.conversationId}` as any);
          } else if (data?.videoId) {
            router.push('/(tabs)/feed' as any);
          }
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
      }
      if (responseListener.current) {
        responseListener.current.remove();
        responseListener.current = null;
      }
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notifications,
        unreadCount,
        markAllRead,
        addNotification,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Genel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        enableVibrate: true,
        enableLights: true,
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Mesajlar',
        description: 'Yeni mesaj bildirimleri',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150],
        lightColor: '#7C3AED',
        enableVibrate: true,
        sound: 'default',
        showBadge: true,
      });
      await Notifications.setNotificationChannelAsync('videos', {
        name: 'Videolar',
        description: 'Yeni video ve beğeni bildirimleri',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        showBadge: true,
      });
    }

    // Try to get the Expo push token (best effort)
    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    if (tokenData?.data) {
      return tokenData.data;
    }

    return null;
  } catch {
    return null;
  }
}

// Helper to schedule a local notification (used from SocketContext)
export async function scheduleLocalNotification(opts: {
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryIdentifier?: string;
  channelId?: string;
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data || {},
        categoryIdentifier: opts.categoryIdentifier,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: opts.channelId || 'default' } : {}),
      },
      trigger: null, // immediate
    });
  } catch {}
}
