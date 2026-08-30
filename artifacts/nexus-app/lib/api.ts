import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@nexus/token';

export function getBaseUrl(): string {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) return configuredApiUrl.replace(/\/+$/, '');

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    const normalizedDomain = domain.trim().replace(/\/+$/, '');
    return /^https?:\/\//i.test(normalizedDomain)
      ? normalizedDomain
      : `https://${normalizedDomain}`;
  }

  throw new Error(
    'Nexus API URL is not configured. Set EXPO_PUBLIC_API_URL for this build.',
  );
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T = any>(
  method: string,
  path: string,
  data?: any,
  isFormData = false,
  retries = 3
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        method,
        headers,
        body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      });

      const json = await response.json().catch(() => ({ error: 'Parse error' }));
      
      if (!response.ok) {
        const errorMsg = json.error || json.message || `Request failed: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      return json as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx) except 408, 429
      if (error instanceof Error && error.message.includes('4') && !error.message.includes('408') && !error.message.includes('429')) {
        throw error;
      }
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export const api = {
  auth: {
    register: (data: { username: string; password: string; displayName: string }) =>
      request('POST', '/api/auth/register', data),
    login: (data: { username: string; password: string }) =>
      request('POST', '/api/auth/login', data),
    me: () => request('GET', '/api/auth/me'),
  },
  users: {
    search: (q: string) =>
      request('GET', `/api/users/search?q=${encodeURIComponent(q)}`),
    get: (id: number) => request('GET', `/api/users/${id}`),
    updateMe: (data: { displayName?: string; bio?: string; age?: number; avatarUrl?: string }) =>
      request('PUT', '/api/users/me', data),
    updateStatus: (data: { statusText: string; statusType: string }) =>
      request('PUT', '/api/users/me/status', data),
    block: (userId: number) => request('POST', `/api/users/${userId}/block`),
    unblock: (userId: number) => request('DELETE', `/api/users/${userId}/block`),
    addContact: (userId: number) => request('POST', `/api/contacts/${userId}`),
    contacts: () => request('GET', '/api/contacts'),
  },
  conversations: {
    list: () => request('GET', '/api/conversations'),
    create: (data: {
      type: string;
      name?: string;
      description?: string;
      avatarUrl?: string;
      isPrivate?: boolean;
      memberIds?: number[];
      targetUserId?: number;
    }) => request('POST', '/api/conversations', data),
    get: (id: number) => request('GET', `/api/conversations/${id}`),
    update: (id: number, data: any) =>
      request('PUT', `/api/conversations/${id}`, data),
    delete: (id: number) => request('DELETE', `/api/conversations/${id}`),
    messages: (id: number, before?: number, limit?: number) =>
      request(
        'GET',
        `/api/conversations/${id}/messages${before ? `?before=${before}` : ''}${limit ? `${before ? '&' : '?'}limit=${limit}` : ''}`
      ),
    sendMessage: (id: number, data: {
      content?: string;
      type: string;
      mediaUrl?: string;
      mediaSize?: number;
      mediaName?: string;
      mediaMime?: string;
      replyToId?: number;
    }) => request('POST', `/api/conversations/${id}/messages`, data),
    editMessage: (id: number, messageId: number, content: string) =>
      request('PUT', `/api/conversations/${id}/messages/${messageId}`, { content }),
    deleteMessage: (id: number, messageId: number) =>
      request('DELETE', `/api/conversations/${id}/messages/${messageId}`),
    addReaction: (id: number, messageId: number, emoji: string) =>
      request('POST', `/api/conversations/${id}/messages/${messageId}/reactions`, { emoji }),
    members: (id: number) => request('GET', `/api/conversations/${id}/members`),
    addMember: (id: number, userId: number) =>
      request('POST', `/api/conversations/${id}/members`, { userId }),
    removeMember: (id: number, userId: number) =>
      request('DELETE', `/api/conversations/${id}/members/${userId}`),
  },
  channels: {
    search: (q: string) =>
      request('GET', `/api/channels/search?q=${encodeURIComponent(q)}`),
    subscribe: (id: number) => request('POST', `/api/channels/${id}/subscribe`),
    unsubscribe: (id: number) => request('DELETE', `/api/channels/${id}/subscribe`),
  },
  feed: {
    videos: (page = 0, type?: 'short' | 'long') =>
      request('GET', `/api/feed/videos?page=${page}${type ? `&type=${type}` : ''}`),
    myVideos: () => request('GET', '/api/feed/my-videos'),
    like: (id: number) => request('POST', `/api/feed/videos/${id}/like`),
    unlike: (id: number) => request('DELETE', `/api/feed/videos/${id}/like`),
    dislike: (id: number) => request('POST', `/api/feed/videos/${id}/dislike`),
    undislike: (id: number) => request('DELETE', `/api/feed/videos/${id}/dislike`),
    comments: (videoId: number, page = 0) =>
      request('GET', `/api/feed/videos/${videoId}/comments?page=${page}`),
    postComment: (videoId: number, content: string) =>
      request('POST', `/api/feed/videos/${videoId}/comments`, { content }),
    deleteComment: (videoId: number, commentId: number) =>
      request('DELETE', `/api/feed/videos/${videoId}/comments/${commentId}`),
    likeComment: (videoId: number, commentId: number) =>
      request('POST', `/api/feed/videos/${videoId}/comments/${commentId}/like`),
    dislikeComment: (videoId: number, commentId: number) =>
      request('POST', `/api/feed/videos/${videoId}/comments/${commentId}/dislike`),
    heartComment: (videoId: number, commentId: number) =>
      request('POST', `/api/feed/videos/${videoId}/comments/${commentId}/heart`),
    pinComment: (videoId: number, commentId: number) =>
      request('POST', `/api/feed/videos/${videoId}/comments/${commentId}/pin`),
    blockUser: (userId: number) => request('POST', `/api/users/${userId}/block`),
  },
  stories: {
    list: () => request('GET', '/api/stories'),
    create: (data: { contentUrl: string; contentType?: string; text?: string }) =>
      request('POST', '/api/stories', data),
  },
  notifications: {
    list: () => request('GET', '/api/notifications'),
    markRead: () => request('PUT', '/api/notifications/read'),
    registerToken: (token: string, platform?: string) =>
      request('POST', '/api/notifications/token', { token, platform }).catch(() => null),
  },
  upload: {
    file: async (uri: string, type: string, name: string): Promise<{ url: string; type: string; size: number; name: string }> => {
      const token = await getToken();
      const formData = new FormData();
      (formData as any).append('file', { uri, type, name });
      const response = await fetch(`${getBaseUrl()}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Upload failed');
      return json;
    },
  },
};
