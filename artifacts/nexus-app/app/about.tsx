import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import FeatureWidget from '@/components/FeatureWidget';

const features = [
  {
    icon: 'lock-closed-outline',
    title: 'Private conversations',
    description:
      'Keep one-to-one conversations focused, fast, and easy to return to.',
  },
  {
    icon: 'people-outline',
    title: 'Groups and channels',
    description:
      'Create communities for close friends, teams, interests, and announcements.',
  },
  {
    icon: 'radio-outline',
    title: 'Stories',
    description:
      'Share a quick moment with your circle and see what your community is up to.',
  },
  {
    icon: 'play-circle-outline',
    title: 'Video feed',
    description:
      'Watch short and long-form videos without leaving the Nexus experience.',
  },
  {
    icon: 'person-circle-outline',
    title: 'Profiles and status',
    description:
      'Make your profile yours with a photo, bio, age, and a status that says more.',
  },
  {
    icon: 'notifications-outline',
    title: 'Useful notifications',
    description:
      'Stay close to the conversations that matter, with controls for every space.',
  },
  {
    icon: 'search-outline',
    title: 'Search and discover',
    description:
      'Find people, groups, and public channels when you are ready to connect.',
  },
  {
    icon: 'heart-outline',
    title: 'Reactions and replies',
    description:
      'Respond naturally with reactions, threaded context, comments, and more.',
  },
];

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          About Nexus
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIconFrame}>
          <Image
            source={require('../assets/images/icon_2.png')}
            style={styles.heroIcon}
            accessibilityLabel="Nexus app icon"
          />
        </View>
        <Text style={styles.heroEyebrow}>NEXUS MESSAGING</Text>
        <Text style={styles.heroTitle}>More than messages.</Text>
        <Text style={styles.heroDescription}>
          One calm space for conversations, communities, stories, and the
          videos worth sharing.
        </Text>
      </LinearGradient>

      <View style={styles.intro}>
        <Text style={[styles.sectionKicker, { color: colors.primary }]}>
          MADE TO CONNECT
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Everything that brings people closer, in one place.
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
          Nexus is designed for real conversations without the noise. Move from
          a private chat to a group, discover a channel, or share a moment with
          the people you care about.
        </Text>
      </View>

      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <FeatureWidget key={feature.title} {...feature} />
        ))}
      </View>

      <View
        style={[
          styles.snapshot,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.snapshotHeader}>
          <View>
            <Text style={[styles.snapshotKicker, { color: colors.accent }]}>
              THE NEXUS WAY
            </Text>
            <Text style={[styles.snapshotTitle, { color: colors.foreground }]}>
              Built for the way you connect.
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={26} color={colors.accent} />
        </View>
        <View style={styles.statRow}>
          {[
            ['1', 'connected space'],
            ['4', 'ways to share'],
            ['∞', 'room to grow'],
          ].map(([value, label]) => (
            <View key={label} style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.exploreLabel, { color: colors.mutedForeground }]}>
        START EXPLORING
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles-outline" size={18} color="#FFF" />
          <Text style={styles.primaryActionText}>Open Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
          onPress={() => router.replace('/(tabs)/explore' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="compass-outline" size={18} color={colors.foreground} />
          <Text style={[styles.secondaryActionText, { color: colors.foreground }]}>
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        Nexus Messaging 1.0.0 · by AltayHR
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  headerSpacer: { width: 40 },
  hero: {
    borderRadius: 24,
    padding: 22,
    minHeight: 258,
    overflow: 'hidden',
    marginTop: 10,
  },
  heroIconFrame: {
    width: 66,
    height: 66,
    borderRadius: 20,
    padding: 2,
    backgroundColor: '#FFFFFF50',
    marginBottom: 22,
  },
  heroIcon: { width: '100%', height: '100%', borderRadius: 18 },
  heroEyebrow: {
    color: '#FFFFFFB8',
    fontSize: 11,
    letterSpacing: 1.7,
    fontFamily: 'Inter_700Bold',
    marginBottom: 7,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.8,
    fontFamily: 'Inter_700Bold',
    marginBottom: 9,
  },
  heroDescription: {
    color: '#FFFFFFD9',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
    maxWidth: 320,
  },
  intro: { paddingVertical: 26 },
  sectionKicker: {
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  snapshot: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 6,
    marginBottom: 26,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  snapshotKicker: {
    fontSize: 10,
    letterSpacing: 1.3,
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  snapshotTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1 },
  statValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'Inter_400Regular',
  },
  exploreLabel: {
    fontSize: 11,
    letterSpacing: 1.3,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
  },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryActionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 24,
  },
});