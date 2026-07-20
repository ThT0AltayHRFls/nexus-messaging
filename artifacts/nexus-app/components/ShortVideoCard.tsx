import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  PanResponder,
  Animated,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import VideoComments from './VideoComments';
import type { Video } from '@/lib/types';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height;

interface Props {
  video: Video;
  isActive?: boolean;
  onUserPress?: () => void;
}

export default function ShortVideoCard({ video, isActive, onUserPress }: Props) {
  const colors = useColors();
  const { user } = useAuth();
  const [liked, setLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likesCount);
  const [disliked, setDisliked] = useState(video.isDisliked);
  const [dislikes, setDislikes] = useState(video.dislikesCount);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1); // 1, 2, 3
  const speedAnim = useRef(new Animated.Value(0)).current;
  const speedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speed control pan responder (hold + swipe right)
  const speedPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dx > 20 && Math.abs(gs.dy) < 40,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gs) => {
        if (gs.dx > 120) {
          if (speedLevel !== 3) {
            setSpeedLevel(3);
            showSpeedIndicator();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        } else if (gs.dx > 50) {
          if (speedLevel !== 2) {
            setSpeedLevel(2);
            showSpeedIndicator();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      },
      onPanResponderRelease: () => {
        setSpeedLevel(1);
        showSpeedIndicator();
      },
    })
  ).current;

  const showSpeedIndicator = () => {
    Animated.sequence([
      Animated.timing(speedAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    if (speedTimeout.current) clearTimeout(speedTimeout.current);
    speedTimeout.current = setTimeout(() => {
      Animated.timing(speedAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 1500);
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

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${video.title || 'Videoyu'} izle: ${video.videoUrl}`,
      });
    } catch {}
  };

  const handleRemix = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remix',
      `"${video.title || 'Bu videoyu'}" remixle?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Remix Yap',
          onPress: () => {
            Alert.alert('✅ Remix alındı', 'Video remix kuyruğuna alındı!');
          },
        },
      ]
    );
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n > 0 ? String(n) : '';
  };

  return (
    <View
      style={[styles.card, { width, height: CARD_HEIGHT }]}
      {...speedPan.panHandlers}
    >
      {/* Thumbnail */}
      {video.thumbnailUrl ? (
        <Image source={{ uri: video.thumbnailUrl }} style={styles.bg} resizeMode="cover" />
      ) : (
        <View style={[styles.bg, { backgroundColor: '#111' }]} />
      )}

      {/* Play overlay */}
      <TouchableOpacity style={styles.playOverlay} onPress={handlePlay} activeOpacity={0.8}>
        <View style={styles.playBtn}>
          <Ionicons name="play" size={40} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Speed indicator */}
      <Animated.View
        style={[
          styles.speedIndicator,
          {
            opacity: speedAnim,
            transform: [{ scale: speedAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.speedBadge}>
          <Ionicons name="flash" size={18} color="#FFF" />
          <Text style={styles.speedText}>{speedLevel}x Hız</Text>
        </View>
        <Text style={styles.speedHint}>
          {speedLevel === 1 ? 'Normal' : speedLevel === 2 ? 'Hızlı' : 'Çok Hızlı'}
        </Text>
      </Animated.View>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Info bottom-left */}
      <View style={styles.info}>
        <TouchableOpacity style={styles.userRow} onPress={onUserPress} activeOpacity={0.8}>
          <Avatar uri={video.userAvatar} name={video.userName} size={38} />
          <Text style={styles.userName}>@{video.userName}</Text>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Takip Et</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {video.title && (
          <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        )}
        {video.description && (
          <Text style={styles.description} numberOfLines={2}>{video.description}</Text>
        )}
        {speedLevel > 1 && (
          <Text style={styles.speedNote}>⚡ Sağa kaydır: {speedLevel}x hız</Text>
        )}
      </View>

      {/* Action buttons right */}
      <View style={styles.actions}>
        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? '#FF3B5C' : '#FFF'}
          />
          <Text style={styles.actionCount}>{formatCount(likes)}</Text>
        </TouchableOpacity>

        {/* Dislike */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleDislike}>
          <Ionicons
            name={disliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={28}
            color={disliked ? '#EF4444' : '#FFF'}
          />
          <Text style={styles.actionCount}>{formatCount(dislikes)}</Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(true)}>
          <Ionicons name="chatbubble-outline" size={30} color="#FFF" />
          <Text style={styles.actionCount}>{formatCount(commentsCount)}</Text>
        </TouchableOpacity>

        {/* Remix */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleRemix}>
          <Ionicons name="shuffle" size={28} color="#FFF" />
          <Text style={styles.actionCount}>Remix</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="paper-plane-outline" size={28} color="#FFF" />
          <Text style={styles.actionCount}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      {/* Comments modal */}
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
  card: { position: 'relative', overflow: 'hidden', backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  speedIndicator: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  speedText: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  speedHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 5,
  },
  info: {
    position: 'absolute',
    bottom: 90,
    left: 14,
    right: 80,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  userName: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followBtnText: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  title: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  speedNote: {
    color: '#FACC15',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 6,
  },
  actions: {
    position: 'absolute',
    right: 10,
    bottom: 95,
    alignItems: 'center',
    gap: 18,
  },
  actionBtn: { alignItems: 'center', gap: 3 },
  actionCount: {
    color: '#FFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
});
