export interface User {
  id: number;
  username: string;
  displayName: string;
  bio?: string | null;
  age?: number | null;
  avatarUrl?: string | null;
  statusText?: string | null;
  statusType?: string | null;
  isOnline?: boolean | null;
  lastSeen?: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string | null;
  content?: string | null;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice' | 'system';
  mediaUrl?: string | null;
  mediaSize?: number | null;
  mediaName?: string | null;
  mediaMime?: string | null;
  replyTo?: Omit<Message, 'replyTo'> | null;
  isEdited?: boolean | null;
  isDeleted?: boolean | null;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group' | 'channel';
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  isPrivate?: boolean | null;
  noMessages?: boolean | null;
  noLinks?: boolean | null;
  noFiles?: boolean | null;
  membersCount?: number;
  unreadCount?: number;
  lastMessage?: Partial<Message> | null;
  otherUser?: User | null;
  myRole?: string;
  createdAt: string;
  createdBy?: number | null;
}

export interface Member {
  id: number;
  userId: number;
  conversationId: number;
  role: string;
  joinedAt: string;
  user: User;
}

export interface Video {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  title?: string | null;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  likesCount: number;
  dislikesCount: number;
  viewsCount: number;
  commentsCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  createdAt: string;
}

export interface VideoComment {
  id: number;
  videoId: number;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  content: string;
  likesCount: number;
  dislikesCount: number;
  heartCount: number;
  isPinned: boolean;
  isLiked: boolean;
  isDisliked: boolean;
  isHearted: boolean;
  createdAt: string;
}

export interface Story {
  id: number;
  userId: number;
  contentUrl: string;
  contentType: 'image' | 'video';
  text?: string | null;
  expiresAt: string;
  viewed?: boolean;
  createdAt: string;
}

export interface StoryGroup {
  userId: number;
  userName: string;
  userAvatar?: string | null;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface AppNotification {
  id: string;
  type: 'message' | 'video_like' | 'comment_heart' | 'new_video' | 'follow' | 'comment_like' | 'many_hearts';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}
