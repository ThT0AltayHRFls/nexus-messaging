import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import type { Conversation } from '@/lib/types';

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [channels, setChannels] = useState<Conversation[]>([]);
  const [myGroups, setMyGroups] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadGroups();
    searchChannels('');
  }, []);

  const loadGroups = async () => {
    try {
      const all = await api.conversations.list();
      setMyGroups(all.filter((c) => c.type === 'group' || c.type === 'channel'));
    } catch {}
    setIsLoading(false);
  };

  const searchChannels = async (q: string) => {
    setIsSearching(true);
    try {
      const results = await api.channels.search(q);
      setChannels(results);
    } catch {}
    setIsSearching(false);
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    searchChannels(text);
  };

  const handleSubscribe = async (conv: Conversation) => {
    try {
      await api.channels.subscribe(conv.id);
      Alert.alert('Subscribed', `You've joined ${conv.name}`);
      loadGroups();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const isChannel = item.type === 'channel';
    const isMember = myGroups.some((g) => g.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => isMember ? router.push(`/conversation/${item.id}` as any) : handleSubscribe(item)}
        activeOpacity={0.8}
      >
        <Avatar uri={item.avatarUrl} name={item.name || 'Group'} size={48} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
            {item.name || 'Group'}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.description || (isChannel ? 'Public channel' : 'Group chat')}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
            {item.membersCount || 0} {isChannel ? 'subscribers' : 'members'}
          </Text>
        </View>
        <View
          style={[
            styles.joinBtn,
            { backgroundColor: isMember ? colors.secondary : colors.primary },
          ]}
        >
          <Text style={[styles.joinBtnText, { color: isMember ? colors.foreground : '#FFF' }]}>
            {isMember ? 'Open' : isChannel ? 'Join' : 'Join'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/create-group' as any)}
          >
            <Ionicons name="people" size={16} color="#FFF" />
            <Text style={styles.createBtnText}>Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/create-channel' as any)}
          >
            <Ionicons name="megaphone" size={16} color="#FFF" />
            <Text style={styles.createBtnText}>Channel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderRadius: colors.radius }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search channels & groups..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={query ? channels : [...myGroups, ...channels.filter((c) => !myGroups.some((g) => g.id === c.id))]}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            !query ? (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                {myGroups.length > 0 ? 'My Groups & Channels' : 'Discover Channels'}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {query ? 'No results found' : 'No groups or channels yet'}
              </Text>
            </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  createBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  list: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  cardDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  cardMeta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 12, textAlign: 'center' },
});
