import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import type { User } from '@/lib/types';

export default function NewConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setUsers([]); return; }
    setIsSearching(true);
    try {
      const results = await api.users.search(q);
      setUsers(results);
    } catch {}
    setIsSearching(false);
  };

  const handleSelect = async (user: User) => {
    setIsCreating(true);
    try {
      const conv = await api.conversations.create({ type: 'direct', targetUserId: user.id });
      router.replace(`/conversation/${conv.id}` as any);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>New Message</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search username..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={search}
          autoFocus
          autoCapitalize="none"
        />
      </View>

      {isCreating && (
        <View style={styles.creating}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.creatingText, { color: colors.mutedForeground }]}>Opening chat...</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userRow, { borderBottomColor: colors.border }]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <Avatar uri={item.avatarUrl} name={item.displayName} size={44} isOnline={!!item.isOnline} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>{item.displayName}</Text>
              <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>@{item.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isSearching && query.length > 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No users found</Text>
            </View>
          ) : null
        }
      />
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
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  creating: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  creatingText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  userHandle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
