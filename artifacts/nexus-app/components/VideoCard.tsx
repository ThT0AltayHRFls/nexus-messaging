import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import Avatar from './Avatar';
import { api } from '@/lib/api';
import type { Video } from '@/lib/types';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height;

interface VideoCardProps {
  video: Video;
  onUserPress?: () => void;
}

export default function VideoCard({ video, onUserPress }: VideoCardProps) {
  const colors = useColors();
  const [liked, setLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likesCount);

  const handleLike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (liked) {
      setLiked(false);
      setLikes((l) => Math.max(0, l - 1));
      try { await api.feed.unlike(video.id); } catch { setLiked(true); setLikes((l) => l + 1); }
    } else {
      setLiked(true);
      setLikes((l) => l + 1);
      try { await api.feed.like(video.id); } catch { setLiked(false); setLikes((l) => Math.max(0, l - 1)); }
    }
  };

  const handlePlay = () => {
    if (video.videoUrl) Linking.openURL(video.videoUrl);
  };

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <View style={[styles.card, { width, height: CARD_HEIGHT }]}>
      {/* Thumbnail / video background */}
      {video.thumbnailUrl ? (
        <Image source={{ uri: video.thumbnailUrl }} style={styles.bg} resizeMode="cover" />
      ) : (
        <View style={[styles.bg, { backgroundColor: colors.card }]} />
      )}

      {/* Play overlay */}
      <TouchableOpacity style={styles.playOverlay} onPress={handlePlay} activeOpacity={0.8}>
        <View style={[styles.playBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Ionicons name="play" size={36} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* User info + caption */}
      <View style={styles.info}>
        <TouchableOpacity style={styles.userRow} onPress={onUserPress} activeOpacity={0.8}>
          <Avatar uri={video.userAvatar} name={video.userName} size={40} />
          <View style={styles.userText}>
            <Text style={styles.userName}>@{video.userName}</Text>
          </View>
          <TouchableOpacity style={[styles.followBtn, { borderColor: '#FFF' }]}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {video.title && (
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
        )}
        {video.description && (
          <Text style={styles.description} numberOfLines={2}>
            {video.description}
          </Text>
        )}
      </View>

      {/* Action buttons (right side) */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? '#FF3B5C' : '#FFF'}
          />
          <Text style={styles.actionCount}>{formatCount(likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={30} color="#FFF" />
          <Text style={styles.actionCount}>{formatCount(video.commentsCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="paper-plane-outline" size={30} color="#FFF" />
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="ellipsis-horizontal" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  info: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  userText: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  followBtn: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  followBtnText: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  title: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    position: 'absolute',
    right: 12,
    bottom: 90,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#FFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
});
