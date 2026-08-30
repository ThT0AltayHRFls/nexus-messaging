import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { api } from '@/lib/api';
import ShortVideoCard from '@/components/ShortVideoCard';
import LongVideoCard from '@/components/LongVideoCard';
import Avatar from '@/components/Avatar';
import type { Video, AppNotification } from '@/lib/types';

const { height } = Dimensions.get('window');

type Tab = 'channel' | 'notifications' | 'short' | 'long';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'channel', label: 'Kanalım', icon: 'tv-outline' },
  { key: 'notifications', label: 'Bildirimler', icon: 'notifications-outline' },
  { key: 'short', label: 'Kısa', icon: 'phone-portrait-outline' },
  { key: 'long', label: 'Uzun', icon: 'play-circle-outline' },
];

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('short');

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'notifications') markAllRead();
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTab === 'short' ? '#000' : colors.background }]}>
      {/* Tab bar */}
      <View
        style={[
          styles.tabBar,
          {
            paddingTop: insets.top + 4,
            backgroundColor: activeTab === 'short' ? 'rgba(0,0,0,0.6)' : colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: activeTab === 'short' ? 0 : 1,
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const showBadge = tab.key === 'notifications' && unreadCount > 0;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrap}>
                <Ionicons
                  name={(isActive
                    ? tab.icon.replace('-outline', '')
                    : tab.icon) as any}
                  size={20}
                  color={
                    activeTab === 'short'
                      ? isActive ? '#FFF' : 'rgba(255,255,255,0.5)'
                      : isActive ? colors.primary : colors.mutedForeground
                  }
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : String(unreadCount)}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === 'short'
                        ? isActive ? '#FFF' : 'rgba(255,255,255,0.5)'
                        : isActive ? colors.primary : colors.mutedForeground,
                    fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && activeTab !== 'short' && (
                <View style={[styles.activeUnderline, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'short' && <ShortVideosFeed topOffset={insets.top + 56} />}
      {activeTab === 'long' && <LongVideosFeed colors={colors} />}
      {activeTab === 'channel' && <MyChannelFeed colors={colors} user={user} />}
      {activeTab === 'notifications' && <NotificationsFeed colors={colors} notifications={notifications} />}
    </View>
  );
}

// ─── Short Videos (TikTok / Reels style) ───────────────────────────────────

function ShortVideosFeed({ topOffset }: { topOffset: number }) {
  const colors = useColors();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => { loadVideos(0); }, []);

  const loadVideos = async (p: number) => {
    try {
      const data: Video[] = await api.feed.videos(p, 'short');
      if (p === 0) setVideos(data);
      else setVideos((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); setPage(0); loadVideos(0); };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <Ionicons name="phone-portrait-outline" size={56} color="rgba(255,255,255,0.3)" />
        <Text style={[styles.emptyTitle, { color: '#FFF' }]}>Kısa video yok</Text>
        <Text style={[styles.emptyText, { color: 'rgba(255,255,255,0.5)' }]}>
          1 dakikadan kısa videolar burada görünür
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => `short-${item.id}`}
      renderItem={({ item, index }) => (
        <ShortVideoCard video={item} isActive={index === activeIndex} />
      )}
      pagingEnabled
      snapToInterval={height}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (hasMore) { const next = page + 1; setPage(next); loadVideos(next); }
      }}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={({ viewableItems }) => {
        if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
      }}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
      }
    />
  );
}

// ─── Long Videos (YouTube style) ────────────────────────────────────────────

function LongVideosFeed({ colors }: { colors: any }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadVideos(0); }, []);

  const loadVideos = async (p: number) => {
    try {
      const data: Video[] = await api.feed.videos(p, 'long');
      if (p === 0) setVideos(data);
      else setVideos((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); setPage(0); loadVideos(0); };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="play-circle-outline" size={56} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Uzun video yok</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          1 dakikadan uzun videolar burada görünür
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => `long-${item.id}`}
      renderItem={({ item }) => <LongVideoCard video={item} />}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (hasMore) { const next = page + 1; setPage(next); loadVideos(next); }
      }}
      onEndReachedThreshold={0.4}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    />
  );
}

// ─── My Channel ─────────────────────────────────────────────────────────────

function MyChannelFeed({ colors, user }: { colors: any; user: any }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadMyVideos(); }, []);

  const loadMyVideos = async () => {
    try {
      const data: Video[] = await api.feed.myVideos();
      setVideos(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); loadMyVideos(); };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Channel header */}
      <View style={[styles.channelHeader, { borderBottomColor: colors.border }]}>
        <Avatar uri={user?.avatarUrl} name={user?.displayName || ''} size={70} />
        <Text style={[styles.channelName, { color: colors.foreground }]}>
          {user?.displayName || user?.username}
        </Text>
        <Text style={[styles.channelUsername, { color: colors.mutedForeground }]}>
          @{user?.username}
        </Text>
        <View style={styles.channelStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{videos.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Video</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {formatCount(videos.reduce((sum, v) => sum + v.viewsCount, 0))}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Görüntüleme</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {formatCount(videos.reduce((sum, v) => sum + v.likesCount, 0))}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Beğeni</Text>
          </View>
        </View>
      </View>

      {/* Videos grid */}
      {videos.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="camera-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 12 }]}>
            Henüz video yok
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Paylaştığınız videolar burada görünür
          </Text>
        </View>
      ) : (
        <View style={styles.videoGrid}>
          {videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              {video.thumbnailUrl ? (
                <Image source={{ uri: video.thumbnailUrl }} style={styles.gridThumb} resizeMode="cover" />
              ) : (
                <View style={[styles.gridThumb, { backgroundColor: '#1a1a2e' }]} />
              )}
              <View style={styles.gridMeta}>
                <Text style={[styles.gridTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {video.title || 'Başlıksız'}
                </Text>
                <View style={styles.gridStats}>
                  <Ionicons name="eye-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.gridStatText, { color: colors.mutedForeground }]}>
                    {formatCount(video.viewsCount)}
                  </Text>
                  <Ionicons name="heart-outline" size={12} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
                  <Text style={[styles.gridStatText, { color: colors.mutedForeground }]}>
                    {formatCount(video.likesCount)}
                  </Text>
                  {(video.duration ?? 0) > 60 ? (
                    <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.typeBadgeText, { color: colors.primary }]}>UZUN</Text>
                    </View>
                  ) : (
                    <View style={[styles.typeBadge, { backgroundColor: '#FF3B5C20' }]}>
                      <Text style={[styles.typeBadgeText, { color: '#FF3B5C' }]}>KISA</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Notifications ───────────────────────────────────────────────────────────

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  message: { icon: 'chatbubble', color: '#7C3AED' },
  video_like: { icon: 'heart', color: '#FF3B5C' },
  comment_heart: { icon: 'heart', color: '#FF3B5C' },
  new_video: { icon: 'play-circle', color: '#22C55E' },
  follow: { icon: 'person-add', color: '#3B82F6' },
  comment_like: { icon: 'thumbs-up', color: '#F59E0B' },
  many_hearts: { icon: 'heart-circle', color: '#FF3B5C' },
};

function NotificationsFeed({
  colors,
  notifications,
}: {
  colors: any;
  notifications: AppNotification[];
}) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  if (notifications.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="notifications-outline" size={56} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Bildirim yok</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Mesajlar, beğeniler ve yeni videolar burada görünür
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
      renderItem={({ item }) => {
        const icon = NOTIF_ICONS[item.type] || { icon: 'notifications', color: colors.primary };
        return (
          <TouchableOpacity
            style={[
              styles.notifRow,
              {
                backgroundColor: item.read ? colors.background : colors.card,
                borderBottomColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
            <View style={[styles.notifIcon, { backgroundColor: icon.color + '20' }]}>
              <Ionicons name={icon.icon as any} size={22} color={icon.color} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>{item.body}</Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingBottom: 0,
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 10,
    position: 'relative',
  },
  tabIconWrap: { position: 'relative', marginBottom: 3 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontFamily: 'Inter_700Bold' },
  tabLabel: { fontSize: 10 },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  // Channel
  channelHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 6,
  },
  channelName: { fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 8 },
  channelUsername: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  channelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  statItem: { alignItems: 'center', gap: 3 },
  statNum: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, height: 32 },
  videoGrid: { padding: 12, gap: 10 },
  gridItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridThumb: { width: '100%', height: 120 },
  gridMeta: { padding: 10 },
  gridTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  gridStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gridStatText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  typeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeBadgeText: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  // Notifications
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -3,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  notifBody: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
