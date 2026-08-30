import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Dimensions,
  SectionList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SETTINGS_SECTIONS = [
  {
    title: 'ACCOUNT',
    data: [
      {
        id: 'profile',
        label: 'Profile Settings',
        icon: 'person-circle',
        color: '#7B5FFA',
        route: '/settings/profile',
        description: 'Edit bio, avatar, pronouns',
      },
      {
        id: 'security',
        label: 'Security & Login',
        icon: 'shield-checkmark',
        color: '#FF6B6B',
        route: '/settings/security',
        description: '2FA, password, sessions',
      },
      {
        id: 'privacy',
        label: 'Privacy & Safety',
        icon: 'lock-closed',
        color: '#4ECDC4',
        route: '/settings/privacy',
        description: 'Who can contact you',
      },
    ],
  },
  {
    title: 'PREFERENCES',
    data: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'notifications',
        color: '#FFB84D',
        route: '/settings/notifications',
        description: 'Alerts and sounds',
      },
      {
        id: 'display',
        label: 'Display & Theme',
        icon: 'contrast',
        color: '#A29BFE',
        route: '/settings/display',
        description: 'Dark/light, fonts, layout',
      },
      {
        id: 'language',
        label: 'Language & Region',
        icon: 'language',
        color: '#00B894',
        route: '/settings/language',
        description: 'Locale, timezone, date format',
      },
      {
        id: 'accessibility',
        label: 'Accessibility',
        icon: 'accessibility',
        color: '#6C5CE7',
        route: '/settings/accessibility',
        description: 'Font size, high contrast',
      },
    ],
  },
  {
    title: 'CONTENT & ACTIVITY',
    data: [
      {
        id: 'blocked',
        label: 'Blocked Users',
        icon: 'ban',
        color: '#D63031',
        route: '/settings/blocked',
        description: 'Manage blocked list',
      },
      {
        id: 'muted',
        label: 'Muted Servers & Users',
        icon: 'volume-mute',
        color: '#FF7675',
        route: '/settings/muted',
        description: 'Silence notifications',
      },
      {
        id: 'data',
        label: 'Data & Privacy',
        icon: 'cloud-upload',
        color: '#00CEC9',
        route: '/settings/data',
        description: 'Download data, GDPR',
      },
      {
        id: 'activity',
        label: 'Activity Log',
        icon: 'time',
        color: '#E17055',
        route: '/settings/activity',
        description: 'Login history, changes',
      },
    ],
  },
  {
    title: 'ADVANCED',
    data: [
      {
        id: 'developer',
        label: 'Developer Options',
        icon: 'code',
        color: '#A29BFE',
        route: '/settings/developer',
        description: 'Debug info, logs',
      },
      {
        id: 'experiments',
        label: 'Experiments',
        icon: 'flask',
        color: '#FD79A8',
        route: '/settings/experiments',
        description: 'Beta features',
      },
      {
        id: 'connection',
        label: 'Connection Settings',
        icon: 'wifi',
        color: '#00B894',
        route: '/settings/connection',
        description: 'Network, compression',
      },
    ],
  },
  {
    title: 'ABOUT',
    data: [
      {
        id: 'about',
        label: 'About Nexus',
        icon: 'information-circle',
        color: '#7B5FFA',
        route: '/settings/about',
        description: 'Version, credits',
      },
      {
        id: 'terms',
        label: 'Terms & Privacy Policy',
        icon: 'document-text',
        color: '#FF6B6B',
        route: '/settings/terms',
        description: 'Legal documents',
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: 'help-circle',
        color: '#FFB84D',
        route: '/settings/help',
        description: 'FAQs, contact support',
      },
    ],
  },
];

export default function SettingsPremiumScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  const renderSettingItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
      onPress={() => handleNavigate(item.route)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.color + '20' },
        ]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>

      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.foreground }]}>
          {item.label}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.mutedForeground }]}>
          {item.description}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        {section.title}
      </Text>
      <View
        style={[
          styles.sectionLine,
          { backgroundColor: colors.primary + '30' },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderSettingItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 20,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View>
            {/* User Info Card */}
            <View
              style={[
                styles.userCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.userCardLeft}>
                <Image
                  source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/60' }}
                  style={styles.userAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>
                    {user?.displayName}
                  </Text>
                  <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>
                    @{user?.username}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View
              style={[
                styles.statsContainer,
                { backgroundColor: colors.secondary },
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>127</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Friends
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>45</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Servers
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>2.5K</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Messages
                </Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 12, marginTop: 20 }}>
            {/* Logout Button */}
            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#FF6B6B" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Version Info */}
            <Text
              style={[
                styles.versionText,
                { color: colors.mutedForeground, marginTop: 20 },
              ]}
            >
              Nexus v1.0.2 (Build 10)
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 12,
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionLine: {
    height: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 11,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
