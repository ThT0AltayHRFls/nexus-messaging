import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  SectionList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'gaming', label: '🎮 Gaming', color: '#7B5FFA' },
  { id: 'education', label: '📚 Education', color: '#00B894' },
  { id: 'lifestyle', label: '✨ Lifestyle', color: '#FFB84D' },
  { id: 'entertainment', label: '🎬 Entertainment', color: '#FF6B6B' },
  { id: 'business', label: '💼 Business', color: '#00CEC9' },
  { id: 'hobbies', label: '🎯 Hobbies', color: '#A29BFE' },
];

const PUBLIC_COMMUNITIES = [
  {
    id: 1,
    name: 'Unity Developers',
    category: 'Gaming',
    icon: '🎮',
    members: 45230,
    description: 'Official Unity game development community',
    verified: true,
    featured: true,
    tags: ['gamedev', 'unity', 'programming'],
  },
  {
    id: 2,
    name: 'Python Learning Hub',
    category: 'Education',
    icon: '🐍',
    members: 128450,
    description: 'Learn Python from basics to advanced',
    verified: true,
    featured: true,
    tags: ['python', 'programming', 'learning'],
  },
  {
    id: 3,
    name: 'Digital Artists Collective',
    category: 'Entertainment',
    icon: '🎨',
    members: 67890,
    description: 'Share artwork, get feedback, collaborate',
    verified: true,
    featured: false,
    tags: ['art', 'design', 'creative'],
  },
  {
    id: 4,
    name: 'Fitness & Health',
    category: 'Lifestyle',
    icon: '💪',
    members: 234500,
    description: 'Fitness tips, health advice, and support',
    verified: true,
    featured: true,
    tags: ['fitness', 'health', 'wellness'],
  },
  {
    id: 5,
    name: 'Indie Hackers',
    category: 'Business',
    icon: '💡',
    members: 89234,
    description: 'Connect with indie founders and builders',
    verified: true,
    featured: false,
    tags: ['startup', 'entrepreneurship', 'business'],
  },
  {
    id: 6,
    name: 'Photography Masters',
    category: 'Hobbies',
    icon: '📷',
    members: 156780,
    description: 'Professional and hobby photographers unite',
    verified: false,
    featured: false,
    tags: ['photography', 'visual', 'creative'],
  },
];

export default function PublicCommunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCommunities = PUBLIC_COMMUNITIES.filter((community) => {
    const matchesSearch = community.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      community.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const featuredCommunities = filteredCommunities.filter((c) => c.featured);

  const renderCommunityItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.communityCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.communityIcon,
          { backgroundColor: colors.secondary },
        ]}
      >
        <Text style={styles.communityEmoji}>{item.icon}</Text>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#00B894" />
          </View>
        )}
      </View>

      <View style={styles.communityContent}>
        <View style={styles.communityHeader}>
          <Text style={[styles.communityName, { color: colors.foreground }]}>
            {item.name}
          </Text>
          {item.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: '#FFB84D' }]}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.communityDescription,
            { color: colors.mutedForeground },
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.communityMeta}>
          <View style={styles.membersInfo}>
            <Ionicons name="people" size={12} color={colors.mutedForeground} />
            <Text
              style={[
                styles.memberCount,
                { color: colors.mutedForeground },
              ]}
            >
              {(item.members / 1000).toFixed(0)}K members
            </Text>
          </View>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag: string) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          { backgroundColor: colors.primary },
        ]}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        {
          backgroundColor:
            selectedCategory === item.id
              ? item.color + '30'
              : colors.secondary,
          borderColor:
            selectedCategory === item.id
              ? item.color
              : colors.border,
        },
      ]}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === item.id ? null : item.id
        )
      }
    >
      <Text style={styles.categoryLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Discover
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: colors.mutedForeground },
          ]}
        >
          Find communities to join
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={colors.mutedForeground}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search communities..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.foreground },
            ]}
          >
            Categories
          </Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryButton}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            scrollEnabled
          />
        </View>

        {/* Featured Communities */}
        {featuredCommunities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#FFB84D" />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.foreground },
                ]}
              >
                Featured
              </Text>
            </View>
            <FlatList
              data={featuredCommunities}
              renderItem={renderCommunityItem}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* All Communities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={colors.primary} />
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground },
              ]}
            >
              Browse All
            </Text>
          </View>
          {filteredCommunities.length > 0 ? (
            <FlatList
              data={filteredCommunities}
              renderItem={renderCommunityItem}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.mutedForeground}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.mutedForeground },
                ]}
              >
                No communities found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  content: {
    paddingVertical: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  communityCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  communityIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  communityEmoji: {
    fontSize: 28,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  communityContent: {
    flex: 1,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  communityDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  communityMeta: {
    gap: 8,
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
