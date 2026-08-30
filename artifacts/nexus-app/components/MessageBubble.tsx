import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  onLongPress?: () => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar = false,
  onLongPress,
}: MessageBubbleProps) {
  const colors = useColors();

  const bubbleBg = isMine ? colors.sent : colors.received;
  const textColor = colors.foreground;
  const timeColor = colors.mutedForeground;

  if (message.isDeleted) {
    return (
      <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: colors.muted, borderRadius: colors.radius + 2 },
          ]}
        >
          <Text style={[styles.deletedText, { color: colors.mutedForeground }]}>
            🚫 Message deleted
          </Text>
        </View>
      </View>
    );
  }

  if (message.type === 'system') {
    return (
      <View style={styles.systemMsgRow}>
        <Text style={[styles.systemMsg, { color: colors.mutedForeground }]}>
          {message.content}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.row,
        isMine ? styles.rowRight : styles.rowLeft,
        styles.bubbleRow,
      ]}
    >
      {!isMine && showAvatar && (
        <View style={styles.avatarWrapper}>
          <Avatar uri={message.senderAvatar} name={message.senderName} size={28} />
        </View>
      )}
      {!isMine && !showAvatar && <View style={styles.avatarPlaceholder} />}

      <TouchableOpacity
        onLongPress={onLongPress}
        activeOpacity={0.85}
        style={[styles.bubbleContainer, isMine ? styles.bubbleRight : styles.bubbleLeft]}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <View
            style={[
              styles.replyPreview,
              { backgroundColor: isMine ? 'rgba(0,0,0,0.2)' : colors.muted, borderLeftColor: colors.primary },
            ]}
          >
            <Text style={[styles.replyName, { color: colors.primary }]} numberOfLines={1}>
              {message.replyTo.senderName}
            </Text>
            <Text style={[styles.replyContent, { color: colors.mutedForeground }]} numberOfLines={1}>
              {message.replyTo.content || `[${message.replyTo.type}]`}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderRadius: colors.radius + 2,
              borderBottomRightRadius: isMine ? 4 : colors.radius + 2,
              borderBottomLeftRadius: isMine ? colors.radius + 2 : 4,
            },
          ]}
        >
          {/* Sender name for group chats */}
          {!isMine && showAvatar && (
            <Text style={[styles.senderName, { color: colors.primary }]}>
              {message.senderName}
            </Text>
          )}

          {/* Image */}
          {message.type === 'image' && message.mediaUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(message.mediaUrl!)}>
              <Image
                source={{ uri: message.mediaUrl }}
                style={styles.msgImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* File */}
          {message.type === 'file' && (
            <TouchableOpacity
              style={[styles.fileCard, { backgroundColor: 'rgba(0,0,0,0.15)' }]}
              onPress={() => message.mediaUrl && Linking.openURL(message.mediaUrl)}
            >
              <Ionicons name="document-attach" size={28} color={colors.primary} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
                  {message.mediaName || 'File'}
                </Text>
                {message.mediaSize && (
                  <Text style={[styles.fileSize, { color: timeColor }]}>
                    {formatFileSize(message.mediaSize)}
                  </Text>
                )}
              </View>
              <Ionicons name="download-outline" size={20} color={timeColor} />
            </TouchableOpacity>
          )}

          {/* Voice */}
          {message.type === 'voice' && (
            <TouchableOpacity
              style={styles.voiceCard}
              onPress={() => message.mediaUrl && Linking.openURL(message.mediaUrl)}
            >
              <Ionicons name="mic" size={22} color={colors.primary} />
              <View style={styles.waveform}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: 6 + Math.sin(i * 0.8) * 10,
                        backgroundColor: isMine ? '#FFFFFF80' : colors.primary + '80',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.voiceDuration, { color: timeColor }]}>0:00</Text>
            </TouchableOpacity>
          )}

          {/* Text content */}
          {message.content && (
            <Text style={[styles.msgText, { color: textColor }]}>{message.content}</Text>
          )}

          {/* Time + edited indicator */}
          <View style={styles.timeRow}>
            {message.isEdited && (
              <Text style={[styles.editedLabel, { color: timeColor }]}>edited </Text>
            )}
            <Text style={[styles.time, { color: timeColor }]}>
              {formatTime(message.createdAt)}
            </Text>
            {isMine && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={timeColor}
                style={styles.checkmark}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  bubbleRow: {
    alignItems: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatarWrapper: {
    marginRight: 6,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 34,
  },
  bubbleContainer: {
    maxWidth: '78%',
  },
  bubbleLeft: {},
  bubbleRight: {},
  bubble: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  senderName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  msgText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  msgImage: {
    width: 220,
    height: 180,
    borderRadius: 10,
    marginBottom: 4,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
    gap: 10,
    minWidth: 180,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  fileSize: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    minWidth: 180,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 32,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 6,
    paddingRight: 8,
  },
  replyName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 1,
  },
  replyContent: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 2,
  },
  editedLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  time: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  checkmark: {
    marginLeft: 2,
  },
  deletedText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  systemMsgRow: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMsg: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
