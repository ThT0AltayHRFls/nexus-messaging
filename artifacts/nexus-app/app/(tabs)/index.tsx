import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useSocket } from '@/context/SocketContext';
import { api } from '@/lib/api';
import ChatListItem from '@/components/ChatListItem';
import Avatar from '@/components/Avatar';
import type { Conversation, StoryGroup } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function ChatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-message', handleNewMessage);
    return () => { socket.off('new-message', handleNewMessage); };
  }, [socket, conversations]);

  const handleNewMessage = useCallback((msg: any) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg }
          : c
      ).sort((a, b) => {
        const ta = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const tb = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return tb - ta;
      })
    );
  }, []);

  const load = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const [convs, storiesData] = await Promise.all([
        api.conversations.list(),
        api.stories.list(),
      ]);
      setConversations(convs);
      setStories(storiesData);
    } catch {}
    setIsLoading(false);
    setIsRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nexus</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/new-conversation' as any)}>
            <Ionicons name="create-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            stories.length > 0 ? (
              <View style={styles.storiesSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storiesScroll}
                >
                  {/* My story */}
                  <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
                    <View style={[styles.storyRing, { borderColor: colors.border }]}>
                      <Avatar uri={user?.avatarUrl} name={user?.displayName || 'Me'} size={52} />
                      <View style={[styles.storyAddBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="add" size={12} color="#FFF" />
                      </View>
                    </View>
                    <Text style={[styles.storyName, { color: colors.mutedForeground }]}>My Story</Text>
                  </TouchableOpacity>

                  {stories.map((group) => (
                    <TouchableOpacity key={group.userId} style={styles.storyItem} activeOpacity={0.8}>
                      <LinearGradient
                        colors={group.hasUnviewed ? [colors.primary, colors.accent] : [colors.border, colors.border]}
                        style={styles.storyRing}
                      >
                        <View style={[styles.storyInner, { backgroundColor: colors.background }]}>
                          <Avatar uri={group.userAvatar} name={group.userName} size={48} />
                        </View>
                      </LinearGradient>
                      <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>
                        {group.userName.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ChatListItem
              conversation={item}
              onPress={() => router.push(`/conversation/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No conversations yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Start a new conversation or join a group
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/new-conversation' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  storiesSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#25254040',
    paddingVertical: 12,
  },
  storiesScroll: { paddingHorizontal: 12, gap: 12 },
  storyItem: { alignItems: 'center', width: 66 },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
    position: 'relative',
  },
  storyInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAddBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
