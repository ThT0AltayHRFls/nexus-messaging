import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import type { User } from '@/lib/types';

export default function UserProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: me } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await api.users.get(userId);
        setUser(u);
      } catch {
        Alert.alert('Error', 'Failed to load profile');
        router.back();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const handleMessage = async () => {
    try {
      const conv = await api.conversations.create({ type: 'direct', targetUserId: userId });
      router.replace(`/conversation/${conv.id}` as any);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleBlock = () => {
    Alert.alert('Block User', `Block @${user?.username}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          setIsBlocking(true);
          try {
            await api.users.block(userId);
            Alert.alert('Blocked', `@${user?.username} has been blocked`);
            router.back();
          } catch {}
          setIsBlocking(false);
        },
      },
    ]);
  };

  if (isLoading || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const isMe = user.id === me?.id;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.foreground} />
        </TouchableOpacity>
        {!isMe && (
          <TouchableOpacity onPress={handleBlock} style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cover + avatar */}
      <LinearGradient
        colors={[colors.primary + '50', colors.background]}
        style={styles.cover}
      >
        <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatarRing}>
          <View style={[styles.avatarInner, { backgroundColor: colors.background }]}>
            <Avatar uri={user.avatarUrl} name={user.displayName} size={80} />
          </View>
        </LinearGradient>

        <View style={styles.onlineDot}>
          <View style={[styles.dot, { backgroundColor: user.isOnline ? colors.online : colors.mutedForeground }]} />
          <Text style={[styles.onlineText, { color: user.isOnline ? colors.online : colors.mutedForeground }]}>
            {user.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.displayName, { color: colors.foreground }]}>{user.displayName}</Text>
        <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>

        {user.statusText && (
          <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statusText, { color: colors.foreground }]}>{user.statusText}</Text>
          </View>
        )}

        {/* Actions */}
        {!isMe && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              onPress={() => api.users.addContact(userId).catch(() => {})}
            >
              <Ionicons name="person-add" size={18} color={colors.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile details */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user.bio && (
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.foreground }]}>{user.bio}</Text>
            </View>
          )}
          {user.age && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.foreground }]}>{user.age} years old</Text>
            </View>
          )}
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="time-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
              {user.isOnline
                ? 'Online now'
                : user.lastSeen
                ? `Last seen ${new Date(user.lastSeen).toLocaleDateString()}`
                : 'Last seen unknown'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  backBtn: { padding: 8 },
  moreBtn: { padding: 8 },
  cover: { height: 200, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  onlineDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  info: { padding: 20, alignItems: 'center' },
  displayName: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  username: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  detailCard: {
    marginTop: 20,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#25254040',
  },
  detailText: { fontSize: 15, fontFamily: 'Inter_400Regular', flex: 1 },
});
