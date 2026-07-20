import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import type { User } from '@/lib/types';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setUsers([]); return; }
    setIsSearching(true);
    try {
      const results = await api.users.search(q.trim());
      setUsers(results);
    } catch {}
    setIsSearching(false);
  };

  const handleUserPress = async (user: User) => {
    try {
      const conv = await api.conversations.create({ type: 'direct', targetUserId: user.id });
      router.replace(`/conversation/${conv.id}` as any);
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderRadius: colors.radius }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by username..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={search}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => search('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userRow, { borderBottomColor: colors.border }]}
              onPress={() => handleUserPress(item)}
              activeOpacity={0.7}
            >
              <Avatar uri={item.avatarUrl} name={item.displayName} size={44} isOnline={!!item.isOnline} />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{item.displayName}</Text>
                <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>@{item.username}</Text>
              </View>
              <Ionicons name="chatbubble-outline" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length > 0 ? (
              <View style={styles.center}>
                <Ionicons name="person-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No users found</Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Search for users to chat with</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  userHandle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 32 },
});
