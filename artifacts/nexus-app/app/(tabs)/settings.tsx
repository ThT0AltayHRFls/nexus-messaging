import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';

interface SettingItem {
  icon: string;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const sections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => router.push('/(tabs)/profile' as any),
        },
        {
          icon: 'happy-outline',
          label: 'Set Status',
          onPress: () => Alert.alert('Status', 'Go to Profile to set your status'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => Alert.alert('Coming Soon', 'Password change via email verification coming soon'),
        },
        {
          icon: 'qr-code-outline',
          label: 'My QR Code',
          onPress: () => Alert.alert('QR Code', `Share: @${user?.username}`),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Messages',
          value: true,
          onToggle: () => {},
        },
        {
          icon: 'people-outline',
          label: 'Group Notifications',
          value: true,
          onToggle: () => {},
        },
        {
          icon: 'megaphone-outline',
          label: 'Channel Updates',
          value: false,
          onToggle: () => {},
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: 'eye-outline',
          label: 'Last Seen',
          onPress: () => Alert.alert('Last Seen', 'Everyone can see your last seen'),
        },
        {
          icon: 'checkmark-done-outline',
          label: 'Read Receipts',
          value: true,
          onToggle: () => {},
        },
        {
          icon: 'ban-outline',
          label: 'Blocked Users',
          onPress: () => Alert.alert('Blocked Users', 'No blocked users'),
        },
        {
          icon: 'shield-outline',
          label: 'Two-Step Verification',
          onPress: () => Alert.alert('Coming Soon', '2FA coming soon'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          value: true,
          onToggle: () => {},
        },
        {
          icon: 'text-outline',
          label: 'Font Size',
          onPress: () => Alert.alert('Font Size', 'Follow system font size settings'),
        },
        {
          icon: 'image-outline',
          label: 'Chat Wallpaper',
          onPress: () => Alert.alert('Coming Soon', 'Custom wallpapers coming soon'),
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'cloud-download-outline',
          label: 'Auto-Download Media',
          onPress: () => Alert.alert('Auto-Download', 'Wi-Fi only'),
        },
        {
          icon: 'trash-outline',
          label: 'Clear Cache',
          onPress: () => Alert.alert('Cache Cleared', 'Cache has been cleared'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          label: 'App Version',
          onPress: () => Alert.alert('Nexus v1.0.0', 'Built by AltayHR'),
        },
        {
          icon: 'sparkles-outline',
          label: 'About Nexus',
          onPress: () => router.push('/about' as any),
        },
        {
          icon: 'code-outline',
          label: 'Developer',
          onPress: () => Alert.alert('Developer', 'AltayHR'),
        },
        {
          icon: 'document-text-outline',
          label: 'Privacy Policy',
          onPress: () => {},
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => Alert.alert('Support', 'Contact: support@nexus.app'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out-outline',
          label: 'Sign Out',
          onPress: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
      </View>

      {/* User card */}
      <TouchableOpacity
        style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push('/(tabs)/profile' as any)}
        activeOpacity={0.8}
      >
        <Avatar uri={user?.avatarUrl} name={user?.displayName || 'User'} size={60} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.displayName}</Text>
          <Text style={[styles.userHandle, { color: colors.mutedForeground }]}>@{user?.username}</Text>
          {user?.statusText && (
            <Text style={[styles.userStatus, { color: colors.mutedForeground }]} numberOfLines={1}>
              {user.statusText}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Settings sections */}
      {sections.map((section, sIdx) => (
        <View key={sIdx} style={styles.section}>
          {section.title ? (
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {section.title}
            </Text>
          ) : null}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={[
                  styles.settingRow,
                  iIdx < section.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={item.onPress}
                disabled={!item.onPress && item.value === undefined}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: item.destructive ? colors.destructive + '20' : colors.primary + '20' },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.destructive ? colors.destructive : colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: item.destructive ? colors.destructive : colors.foreground },
                  ]}
                >
                  {item.label}
                </Text>
                {item.onToggle !== undefined ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={item.value ? '#FFF' : colors.mutedForeground}
                  />
                ) : (
                  item.onPress && (
                    <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                  )
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Nexus Messaging v1.0.0{'\n'}by AltayHR
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  userHandle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  userStatus: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, fontStyle: 'italic' },
  section: { marginTop: 8, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    padding: 32,
    lineHeight: 18,
  },
});
