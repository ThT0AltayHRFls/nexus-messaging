import React, { useState, useEffect, useRef } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator, Text, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { api } from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import type { Video } from '@/lib/types';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadVideos(0);
  }, []);

  const loadVideos = async (p: number) => {
    try {
      const data = await api.feed.videos(p);
      if (p === 0) {
        setVideos(data);
      } else {
        setVideos((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
    } catch {}
    setIsLoading(false);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    loadVideos(next);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No videos yet</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Videos shared by users will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <FlatList
        data={videos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <VideoCard video={item} />}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 32 },
});
