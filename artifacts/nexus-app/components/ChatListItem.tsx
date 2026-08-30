import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import type { Conversation } from '@/lib/types';

interface ChatListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function getLastMessagePreview(conv: Conversation): string {
  const msg = conv.lastMessage;
  if (!msg) return 'Start a conversation';
  if (msg.isDeleted) return '🚫 Message deleted';
  const prefix = '';
  switch (msg.type) {
    case 'image':
      return `${prefix}📷 Photo`;
    case 'video':
      return `${prefix}🎥 Video`;
    case 'audio':
    case 'voice':
      return `${prefix}🎤 Voice message`;
    case 'file':
      return `${prefix}📎 File`;
    default:
      return `${prefix}${msg.content || ''}`;
  }
}

function getConvName(conv: Conversation): string {
  if (conv.type === 'direct') return conv.otherUser?.displayName || 'User';
  return conv.name || (conv.type === 'channel' ? 'Channel' : 'Group');
}

function getConvAvatar(conv: Conversation): string | null | undefined {
  if (conv.type === 'direct') return conv.otherUser?.avatarUrl;
  return conv.avatarUrl;
}

function getConvIcon(type: string): string {
  if (type === 'group') return 'people';
  if (type === 'channel') return 'megaphone';
  return 'person';
}

export default function ChatListItem({ conversation, onPress }: ChatListItemProps) {
  const colors = useColors();

  const name = getConvName(conversation);
  const avatar = getConvAvatar(conversation);
  const preview = getLastMessagePreview(conversation);
  const time = formatTime(conversation.lastMessage?.createdAt);
  const unread = conversation.unreadCount || 0;
  const isOnline =
    conversation.type === 'direct' && !!conversation.otherUser?.isOnline;

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarSection}>
        <Avatar uri={avatar} name={name} size={52} isOnline={isOnline} borderColor={colors.background} />
        {conversation.type !== 'direct' && (
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: colors.primary, borderColor: colors.background },
            ]}
          >
            <Ionicons name={getConvIcon(conversation.type) as any} size={10} color="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.time, { color: unread > 0 ? colors.primary : colors.mutedForeground }]}>
            {time}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[styles.preview, { color: colors.mutedForeground, flex: 1 }]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {unread > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : String(unread)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 12,
  },
  typeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
