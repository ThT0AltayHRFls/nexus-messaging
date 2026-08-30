import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  Alert,
  Share,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import { api } from '@/lib/api';
import VideoComments from './VideoComments';
import type { Video } from '@/lib/types';

const { width } = Dimensions.get('window');
const THUMB_HEIGHT = (width - 32) * (9 / 16);

const formatDuration = (secs?: number | null) => {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

interface Props {
  video: Video;
  onUserPress?: () => void;
}

export default function LongVideoCard({ video, onUserPress }: Props) {
  const colors = useColors();
  const [liked, setLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likesCount);
  const [disliked, setDisliked] = useState(video.isDisliked);
  const [dislikes, setDislikes] = useState(video.dislikesCount);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1);
  const speedAnim = React.useRef(new Animated.Value(0)).current;
  const speedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const speedPan = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dx > 25 && Math.abs(gs.dy) < 40,
      onPanResponderMove: (_, gs) => {
        const newLevel = gs.dx > 120 ? 3 : gs.dx > 50 ? 2 : 1;
        if (newLevel !== speedLevel) {
          setSpeedLevel(newLevel);
          Haptics.impactAsync(
            newLevel === 3 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
          );
          showSpeed();
        }
      },
      onPanResponderRelease: () => {
        setSpeedLevel(1);
        showSpeed();
      },
    })
  ).current;

  const showSpeed = () => {
    Animated.timing(speedAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    if (speedTimeout.current) clearTimeout(speedTimeout.current);
    speedTimeout.current = setTimeout(() => {
      Animated.timing(speedAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 1400);
  };

  const handleLike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (liked) {
      setLiked(false);
      setLikes((l) => Math.max(0, l - 1));
      try { await api.feed.unlike(video.id); } catch { setLiked(true); setLikes((l) => l + 1); }
    } else {
      setLiked(true);
      setLikes((l) => l + 1);
      if (disliked) { setDisliked(false); setDislikes((d) => Math.max(0, d - 1)); }
      try { await api.feed.like(video.id); } catch { setLiked(false); setLikes((l) => Math.max(0, l - 1)); }
    }
  };

  const handleDislike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (disliked) {
      setDisliked(false);
      setDislikes((d) => Math.max(0, d - 1));
      try { await api.feed.undislike(video.id); } catch { setDisliked(true); setDislikes((d) => d + 1); }
    } else {
      setDisliked(true);
      setDislikes((d) => d + 1);
      if (liked) { setLiked(false); setLikes((l) => Math.max(0, l - 1)); }
      try { await api.feed.dislike(video.id); } catch { setDisliked(false); setDislikes((d) => Math.max(0, d - 1)); }
    }
  };

  const handlePlay = () => {
    if (video.videoUrl) Linking.openURL(video.videoUrl).catch(() => {});
  };

  const handleRemix = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remix', `"${video.title || 'Bu videoyu'}" remixle?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Remix Yap', onPress: () => Alert.alert('✅ Remix alındı', 'Video remix kuyruğuna alındı!') },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${video.title || 'Video'}: ${video.videoUrl}` });
    } catch {}
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Thumbnail */}
      <TouchableOpacity
        onPress={handlePlay}
        activeOpacity={0.92}
        {...speedPan.panHandlers}
      >
        <View style={[styles.thumbWrap, { height: THUMB_HEIGHT }]}>
          {video.thumbnailUrl ? (
            <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, { backgroundColor: '#1a1a2e' }]} />
          )}
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={52} color="rgba(255,255,255,0.9)" />
          </View>
          {video.duration != null && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
            </View>
          )}
          {/* Speed indicator overlay */}
          <Animated.View
            style={[styles.speedOverlay, { opacity: speedAnim }]}
            pointerEvents="none"
          >
            <View style={styles.speedBadge}>
              <Ionicons name="flash" size={16} color="#FFF" />
              <Text style={styles.speedText}>{speedLevel}x</Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Meta */}
      <View style={styles.meta}>
        <TouchableOpacity onPress={onUserPress} style={styles.userRow}>
          <Avatar uri={video.userAvatar} name={video.userName} size={34} />
          <View style={styles.userInfo}>
            <Text style={[styles.videoTitle, { color: colors.foreground }]} numberOfLines={2}>
              {video.title || 'Başlıksız Video'}
            </Text>
            <Text style={[styles.userName, { color: colors.mutedForeground }]}>
              @{video.userName} • {formatCount(video.viewsCount)} görüntüleme
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action bar */}
        <View style={[styles.actionBar, { borderTopColor: colors.border }]}>
          {/* Like */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={liked ? 'thumbs-up' : 'thumbs-up-outline'}
              size={20}
              color={liked ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.actionLabel, { color: liked ? colors.primary : colors.mutedForeground }]}>
              {formatCount(likes)}
            </Text>
          </TouchableOpacity>

          {/* Dislike */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleDislike}>
            <Ionicons
              name={disliked ? 'thumbs-down' : 'thumbs-down-outline'}
              size={20}
              color={disliked ? '#EF4444' : colors.mutedForeground}
            />
            <Text style={[styles.actionLabel, { color: disliked ? '#EF4444' : colors.mutedForeground }]}>
              {dislikes > 0 ? formatCount(dislikes) : ''}
            </Text>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>
              {formatCount(commentsCount)}
            </Text>
          </TouchableOpacity>

          {/* Remix */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleRemix}>
            <Ionicons name="shuffle" size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>Remix</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </View>

      <VideoComments
        visible={showComments}
        onClose={() => setShowComments(false)}
        videoId={video.id}
        videoOwnerId={video.userId}
        totalComments={commentsCount}
        onCommentCountChange={(d) => setCommentsCount((c) => c + d)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbWrap: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  thumb: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  speedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  speedText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  meta: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  userRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  userInfo: { flex: 1 },
  videoTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 3,
  },
  userName: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
    paddingBottom: 6,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 4 },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
