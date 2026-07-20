import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import MessageBubble from '@/components/MessageBubble';
import type { Message, Conversation } from '@/lib/types';

export default function ConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: me } = useAuth();
  const { socket } = useSocket();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = parseInt(id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [typingLabel, setTypingLabel] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const flatListRef = useRef<FlatList>(null);

  // Load initial data
  useEffect(() => {
    (async () => {
      try {
        const [conv, msgs] = await Promise.all([
          api.conversations.get(conversationId),
          api.conversations.messages(conversationId),
        ]);
        setConversation(conv);
        setMessages(msgs);
      } catch {
        Alert.alert('Error', 'Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [conversationId]);

  // Socket room
  useEffect(() => {
    socket?.emit('join-conversation', conversationId);
    return () => { socket?.emit('leave-conversation', conversationId); };
  }, [socket, conversationId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };

    const onUserTyping = () => {
      setTypingLabel('typing...');
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingLabel(''), 3000);
    };

    const onMessageEdited = (updated: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    };

    const onMessageDeleted = ({ messageId }: { messageId: number }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: null } : m))
      );
    };

    socket.on('new-message', onNewMessage);
    socket.on('user-typing', onUserTyping);
    socket.on('message-edited', onMessageEdited);
    socket.on('message-deleted', onMessageDeleted);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('user-typing', onUserTyping);
      socket.off('message-edited', onMessageEdited);
      socket.off('message-deleted', onMessageDeleted);
    };
  }, [socket, conversationId]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      socket?.emit('typing', { conversationId });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      socket?.emit('stop-typing', { conversationId });
    }, 1500);
  };

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || isSending) return;
    setInputText('');
    const replyId = replyTo?.id;
    setReplyTo(null);
    setIsSending(true);
    try {
      await api.conversations.sendMessage(conversationId, {
        content,
        type: 'text',
        replyToId: replyId,
      });
    } catch {
      Alert.alert('Error', 'Failed to send message');
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        const uploaded = await api.upload.file(
          asset.uri, 'image/jpeg', `photo-${Date.now()}.jpg`
        );
        await api.conversations.sendMessage(conversationId, {
          type: 'image',
          mediaUrl: uploaded.url,
          mediaSize: uploaded.size,
          mediaName: uploaded.name,
        });
      } catch {
        Alert.alert('Error', 'Failed to send image');
      }
    }
  };

  const handleMsgLongPress = useCallback((item: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isMine = item.senderId === me?.id;
    Alert.alert('Message', undefined, [
      { text: 'Reply', onPress: () => setReplyTo(item) },
      ...(isMine && !item.isDeleted
        ? [
            {
              text: 'Delete',
              style: 'destructive' as const,
              onPress: async () => {
                try { await api.conversations.deleteMessage(conversationId, item.id); } catch {}
              },
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [me?.id, conversationId]);

  const title =
    conversation?.type === 'direct'
      ? conversation.otherUser?.displayName ?? 'User'
      : conversation?.name ?? 'Group';

  const subtitle =
    typingLabel ||
    (conversation?.type === 'direct'
      ? conversation.otherUser?.isOnline ? 'online' : 'last seen recently'
      : `${conversation?.membersCount ?? 0} members`);

  const isOnline = conversation?.type === 'direct' && !!conversation.otherUser?.isOnline;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerMid}
          activeOpacity={0.75}
          onPress={() => {
            if (conversation?.type === 'direct' && conversation.otherUser) {
              router.push(`/user/${conversation.otherUser.id}` as any);
            }
          }}
        >
          <Avatar
            uri={
              conversation?.type === 'direct'
                ? conversation.otherUser?.avatarUrl
                : conversation?.avatarUrl
            }
            name={title}
            size={36}
            isOnline={isOnline}
            borderColor={colors.card}
          />
          <View style={styles.headerText}>
            <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
              {title}
            </Text>
            <Text
              style={[
                styles.headerSub,
                { color: isOnline || typingLabel ? colors.online : colors.mutedForeground },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => Alert.alert('Voice Call', 'Coming soon')}
            style={styles.iconBtn}
          >
            <Ionicons name="call-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Video Call', 'Coming soon')}
            style={styles.iconBtn}
          >
            <Ionicons name="videocam-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            isMine={item.senderId === me?.id}
            showAvatar={
              conversation?.type !== 'direct' &&
              (index === 0 || messages[index - 1]?.senderId !== item.senderId)
            }
            onLongPress={() => handleMsgLongPress(item)}
          />
        )}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {/* Reply banner */}
      {replyTo && (
        <View
          style={[
            styles.replyBar,
            { backgroundColor: colors.secondary, borderLeftColor: colors.primary },
          ]}
        >
          <View style={styles.replyBarContent}>
            <Text style={[styles.replyBarName, { color: colors.primary }]}>
              {replyTo.senderName}
            </Text>
            <Text
              style={[styles.replyBarText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {replyTo.isDeleted ? 'Deleted message' : replyTo.content || `[${replyTo.type}]`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)} style={styles.replyBarClose}>
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 6,
            },
          ]}
        >
          <TouchableOpacity onPress={handlePickImage} style={styles.inputBtn}>
            <Ionicons name="image-outline" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={[styles.inputBox, { backgroundColor: colors.input, borderRadius: 22 }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Message..."
              placeholderTextColor={colors.mutedForeground}
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              maxLength={4000}
            />
          </View>

          {inputText.trim() ? (
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending}
              style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: 22 }]}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.inputBtn}
              onPress={() => Alert.alert('Voice Message', 'Hold to record — coming soon')}
            >
              <Ionicons name="mic-outline" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6 },
  headerMid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  headerText: { flex: 1 },
  headerName: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  headerRight: { flexDirection: 'row' },
  iconBtn: { padding: 8 },
  msgList: { paddingVertical: 8, paddingHorizontal: 4 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderRadius: 8,
    gap: 8,
  },
  replyBarContent: { flex: 1 },
  replyBarName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  replyBarText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  replyBarClose: { padding: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  inputBtn: { padding: 6, paddingBottom: 8 },
  inputBox: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
    minHeight: 42,
    justifyContent: 'center',
  },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  sendBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});
