import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { VideoComment } from '@/lib/types';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
  return `${Math.floor(diff / 86400)}g`;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  videoId: number;
  videoOwnerId: number;
  totalComments: number;
  onCommentCountChange?: (delta: number) => void;
}

export default function VideoComments({
  visible,
  onClose,
  videoId,
  videoOwnerId,
  totalComments,
  onCommentCountChange,
}: Props) {
  const colors = useColors();
  const { user } = useAuth();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const translateY = useRef(new Animated.Value(600)).current;
  const isOwner = user?.id === videoOwnerId;

  useEffect(() => {
    if (visible) {
      setComments([]);
      setPage(0);
      setHasMore(true);
      loadComments(0);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadComments = async (p: number) => {
    setLoading(true);
    try {
      const data: VideoComment[] = await api.feed.comments(videoId, p);
      if (p === 0) setComments(data);
      else setComments((prev) => [...prev, ...data]);
      setHasMore(data.length === 20);
    } catch {}
    setLoading(false);
  };

  const sendComment = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const newComment: VideoComment = await api.feed.postComment(videoId, content);
      setComments((prev) => [newComment, ...prev]);
      onCommentCountChange?.(1);
    } catch {
      setText(content);
      Alert.alert('Hata', 'Yorum gönderilemedi');
    }
    setSending(false);
  };

  const handleLike = async (comment: VideoComment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isLiked: !c.isLiked,
              likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
              isDisliked: false,
            }
          : c
      )
    );
    try {
      await api.feed.likeComment(videoId, comment.id);
    } catch {}
  };

  const handleDislike = async (comment: VideoComment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isDisliked: !c.isDisliked,
              dislikesCount: c.isDisliked ? c.dislikesCount - 1 : c.dislikesCount + 1,
              isLiked: false,
            }
          : c
      )
    );
    try {
      await api.feed.dislikeComment(videoId, comment.id);
    } catch {}
  };

  const handleHeart = async (comment: VideoComment) => {
    if (!isOwner) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isHearted: !c.isHearted,
              heartCount: c.isHearted ? c.heartCount - 1 : c.heartCount + 1,
            }
          : c
      )
    );
    try {
      await api.feed.heartComment(videoId, comment.id);
    } catch {}
  };

  const handlePin = async (comment: VideoComment) => {
    if (!isOwner) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id ? { ...c, isPinned: !c.isPinned } : { ...c, isPinned: false }
      )
    );
    try {
      await api.feed.pinComment(videoId, comment.id);
    } catch {}
  };

  const handleDelete = (comment: VideoComment) => {
    const canDelete = isOwner || comment.userId === user?.id;
    if (!canDelete) return;
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => prev.filter((c) => c.id !== comment.id));
          onCommentCountChange?.(-1);
          try {
            await api.feed.deleteComment(videoId, comment.id);
          } catch {}
        },
      },
    ]);
  };

  const handleBlockUser = (comment: VideoComment) => {
    if (!isOwner) return;
    Alert.alert(
      `@${comment.userName} Engelle`,
      'Bu kullanıcıyı engellemek istiyor musunuz? Videoları karşınıza çıkmayacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.feed.blockUser(comment.userId);
              Alert.alert('Engellendi', `@${comment.userName} engellendi`);
            } catch {}
          },
        },
      ]
    );
  };

  const showOwnerMenu = (comment: VideoComment) => {
    if (!isOwner && comment.userId !== user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const buttons: any[] = [
      {
        text: comment.isPinned ? '📌 Sabitlemeyi Kaldır' : '📌 Yorumu Sabitle',
        onPress: () => handlePin(comment),
      },
    ];
    if (isOwner && comment.userId !== user?.id) {
      buttons.push({
        text: '🚫 Kullanıcıyı Engelle',
        style: 'destructive',
        onPress: () => handleBlockUser(comment),
      });
    }
    buttons.push({
      text: '🗑 Yorumu Sil',
      style: 'destructive',
      onPress: () => handleDelete(comment),
    });
    buttons.push({ text: 'İptal', style: 'cancel' });
    Alert.alert('Yorum', undefined, buttons);
  };

  const renderComment = ({ item }: { item: VideoComment }) => {
    const canManage = isOwner || item.userId === user?.id;
    return (
      <View style={[styles.commentRow, item.isPinned && { backgroundColor: colors.card + '80' }]}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={11} color={colors.primary} />
            <Text style={[styles.pinnedText, { color: colors.primary }]}>Sabitlenmiş</Text>
          </View>
        )}
        <View style={styles.commentContent}>
          <Avatar uri={item.userAvatar} name={item.userName} size={34} />
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentUser, { color: colors.foreground }]}>
                @{item.userName}
              </Text>
              <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
                {formatTime(item.createdAt)}
              </Text>
              {canManage && (
                <TouchableOpacity onPress={() => showOwnerMenu(item)} style={styles.menuBtn}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.commentText, { color: colors.foreground }]}>{item.content}</Text>
            <View style={styles.commentActions}>
              {/* Like */}
              <TouchableOpacity style={styles.actionItem} onPress={() => handleLike(item)}>
                <Ionicons
                  name={item.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={15}
                  color={item.isLiked ? colors.primary : colors.mutedForeground}
                />
                <Text style={[styles.actionNum, { color: colors.mutedForeground }]}>
                  {item.likesCount > 0 ? item.likesCount : ''}
                </Text>
              </TouchableOpacity>
              {/* Dislike */}
              <TouchableOpacity style={styles.actionItem} onPress={() => handleDislike(item)}>
                <Ionicons
                  name={item.isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                  size={15}
                  color={item.isDisliked ? '#EF4444' : colors.mutedForeground}
                />
              </TouchableOpacity>
              {/* Heart (owner only) */}
              {isOwner && (
                <TouchableOpacity style={styles.actionItem} onPress={() => handleHeart(item)}>
                  <Ionicons
                    name={item.isHearted ? 'heart' : 'heart-outline'}
                    size={15}
                    color={item.isHearted ? '#FF3B5C' : colors.mutedForeground}
                  />
                  {item.heartCount > 0 && (
                    <Text style={[styles.actionNum, { color: colors.mutedForeground }]}>
                      {item.heartCount}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {/* Heart received badge for non-owner */}
              {!isOwner && item.heartCount > 0 && (
                <View style={styles.actionItem}>
                  <Ionicons name="heart" size={14} color="#FF3B5C" />
                  <Text style={[styles.actionNum, { color: colors.mutedForeground }]}>
                    {item.heartCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const sortedComments = [...comments].sort((a, b) =>
    b.isPinned ? 1 : a.isPinned ? -1 : 0
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Yorumlar • {totalComments}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Comments list */}
        {loading && comments.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={sortedComments}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderComment}
            onEndReached={() => {
              if (hasMore && !loading) {
                const next = page + 1;
                setPage(next);
                loadComments(next);
              }
            }}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                Henüz yorum yok. İlk yorumu siz yapın!
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <Avatar uri={user?.avatarUrl} name={user?.displayName || ''} size={32} />
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Yorum yaz..."
              placeholderTextColor={colors.mutedForeground}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendComment}
            />
            <TouchableOpacity
              onPress={sendComment}
              disabled={!text.trim() || sending}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    text.trim() && !sending ? colors.primary : colors.card,
                },
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={text.trim() ? '#FFF' : colors.mutedForeground}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleBar: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  commentRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    marginLeft: 44,
  },
  pinnedText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  commentContent: { flexDirection: 'row', gap: 10 },
  commentBody: { flex: 1 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  commentUser: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  commentTime: { fontFamily: 'Inter_400Regular', fontSize: 11, flex: 1 },
  menuBtn: { padding: 2 },
  commentText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 19 },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionNum: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    maxHeight: 90,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
