/**
 * Advanced Messaging Features for Nexus Messaging App
 * - Message Recall/Unsend
 * - Message Reactions
 * - Typing Indicators
 * - Delivery Status
 * - Message Encryption (basic)
 */

export interface MessageFeatures {
  canRecall: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReact: boolean;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  reactions: Record<string, string[]>;
}

export interface CallSession {
  callId: string;
  type: 'voice' | 'video';
  initiator: number;
  recipient: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
}

/**
 * Message Recall/Unsend
 * Only works within 5 minutes of sending
 */
export function canRecallMessage(sentAtTimestamp: number): boolean {
  const RECALL_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const timeSinceSent = Date.now() - sentAtTimestamp;
  return timeSinceSent < RECALL_WINDOW_MS;
}

/**
 * Message Reactions Handler
 */
export function addReaction(
  reactions: Record<string, string[]>,
  emoji: string,
  userId: number
): Record<string, string[]> {
  const updated = { ...reactions };
  if (!updated[emoji]) {
    updated[emoji] = [];
  }
  if (!updated[emoji].includes(String(userId))) {
    updated[emoji].push(String(userId));
  }
  return updated;
}

export function removeReaction(
  reactions: Record<string, string[]>,
  emoji: string,
  userId: number
): Record<string, string[]> {
  const updated = { ...reactions };
  if (updated[emoji]) {
    updated[emoji] = updated[emoji].filter(id => id !== String(userId));
    if (updated[emoji].length === 0) {
      delete updated[emoji];
    }
  }
  return updated;
}

/**
 * Delivery Status Tracking
 */
export const DELIVERY_STATUS_ICONS = {
  pending: '⏱️',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
};

/**
 * Message Validation
 */
export function validateMessage(content: string | null, type: string): {
  isValid: boolean;
  error?: string;
} {
  if (type === 'text') {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    if (content.length > 4000) {
      return { isValid: false, error: 'Message is too long (max 4000 chars)' };
    }
  }

  if (type === 'image' && !content) {
    return { isValid: false, error: 'Image URL is required' };
  }

  if (type === 'video' && !content) {
    return { isValid: false, error: 'Video URL is required' };
  }

  return { isValid: true };
}

/**
 * Call Session Management
 */
export function createCallSession(
  callId: string,
  type: 'voice' | 'video',
  initiator: number,
  recipient: number
): CallSession {
  return {
    callId,
    type,
    initiator,
    recipient,
    status: 'initiated',
  };
}

export function updateCallStatus(
  session: CallSession,
  status: CallSession['status']
): CallSession {
  return {
    ...session,
    status,
    startTime: status === 'accepted' ? Date.now() : session.startTime,
    endTime: (status === 'rejected' || status === 'ended' || status === 'missed') ? Date.now() : session.endTime,
  };
}

export function calculateCallDuration(session: CallSession): number | null {
  if (!session.startTime || !session.endTime) return null;
  return Math.floor((session.endTime - session.startTime) / 1000); // seconds
}

/**
 * Message Search
 */
export function searchMessages(
  messages: any[],
  query: string
): any[] {
  const lowerQuery = query.toLowerCase();
  return messages.filter(msg => {
    if (msg.isDeleted) return false;
    if (msg.type === 'text' && msg.content) {
      return msg.content.toLowerCase().includes(lowerQuery);
    }
    return false;
  });
}

/**
 * Message Grouping by Date
 */
export function groupMessagesByDate(messages: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  messages.forEach(msg => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toLocaleDateString();
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(msg);
  });

  return grouped;
}

/**
 * Typing Indicator Management
 */
export function handleTypingIndicator(
  isTyping: boolean,
  conversationId: number,
  socket: any
): void {
  if (isTyping) {
    socket?.emit('typing', { conversationId });
  } else {
    socket?.emit('stop-typing', { conversationId });
  }
}

/**
 * Conversation Summary
 */
export interface ConversationSummary {
  conversationId: number;
  lastMessage: string | null;
  lastMessageTime: string;
  unreadCount: number;
  memberCount?: number;
  totalMessages: number;
}

export function generateConversationSummary(
  conversationId: number,
  messages: any[],
  unreadCount: number,
  memberCount?: number
): ConversationSummary {
  const lastMessage = messages[messages.length - 1];
  
  return {
    conversationId,
    lastMessage: lastMessage?.content || `[${lastMessage?.type}]` || null,
    lastMessageTime: lastMessage?.createdAt || new Date().toISOString(),
    unreadCount,
    memberCount,
    totalMessages: messages.length,
  };
}
