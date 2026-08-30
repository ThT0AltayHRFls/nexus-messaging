import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export default function PrivacySettingsScreen() {
  const colors = useColors();

  const [profileVisibility, setProfileVisibility] = useState('PUBLIC');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [blockDMs, setBlockDMs] = useState(false);
  const [allowSearch, setAllowSearch] = useState(true);
  const [blockedCount, setBlockedCount] = useState(3);

  const handleResetPrivacy = () => {
    Alert.alert('Reset Privacy', 'Restore default privacy settings?', [
      { text: 'Cancel' },
      {
        text: 'Reset',
        onPress: () => {
          setProfileVisibility('PUBLIC');
          setShowOnlineStatus(true);
          setShowActivity(true);
          setShowLastSeen(true);
          setAllowFriendRequests(true);
          setAllowGroupInvites(true);
          setBlockDMs(false);
          setAllowSearch(true);
        },
      },
    ]);
  };

  const SettingRow = ({ label, description, value, onChange }: any) => (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.secondary, true: colors.primary }}
      />
    </View>
  );

  const VisibilityOption = ({ label, value, selected }: any) => (
    <TouchableOpacity
      style={[
        styles.visibilityOption,
        {
          backgroundColor: selected ? colors.primary + '20' : colors.secondary,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setProfileVisibility(value)}
    >
      <Ionicons
        name={value === 'PUBLIC' ? 'globe' : value === 'FRIENDS_ONLY' ? 'people' : 'lock-closed'}
        size={20}
        color={selected ? colors.primary : colors.mutedForeground}
      />
      <Text style={[styles.visibilityLabel, { color: colors.foreground }]}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Visibility */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profile Visibility</Text>
          <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
            Control who can see your profile
          </Text>

          <View style={styles.visibilityGrid}>
            <VisibilityOption label="Public" value="PUBLIC" selected={profileVisibility === 'PUBLIC'} />
            <VisibilityOption label="Friends" value="FRIENDS_ONLY" selected={profileVisibility === 'FRIENDS_ONLY'} />
            <VisibilityOption label="Private" value="PRIVATE" selected={profileVisibility === 'PRIVATE'} />
          </View>
        </View>

        {/* Status Settings */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Status & Activity</Text>

          <SettingRow
            label="Online Status"
            description="Show when you're active"
            value={showOnlineStatus}
            onChange={setShowOnlineStatus}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Activity Status"
            description="Show what you're doing"
            value={showActivity}
            onChange={setShowActivity}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Last Seen"
            description="Show when you last used Nexus"
            value={showLastSeen}
            onChange={setShowLastSeen}
          />
        </View>

        {/* Contact Settings */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Who Can Contact You</Text>

          <SettingRow
            label="Friend Requests"
            description="Allow others to send you friend requests"
            value={allowFriendRequests}
            onChange={setAllowFriendRequests}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Group Invites"
            description="Allow group/server invitations"
            value={allowGroupInvites}
            onChange={setAllowGroupInvites}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Direct Messages"
            description="Block all direct messages"
            value={blockDMs}
            onChange={setBlockDMs}
          />
        </View>

        {/* Discoverability */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Discoverability</Text>

          <SettingRow
            label="Searchable"
            description="Allow users to find you via search"
            value={allowSearch}
            onChange={setAllowSearch}
          />

          <TouchableOpacity
            style={[styles.blockedUsersButton, { borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Ionicons name="ban" size={20} color="#FF6B6B" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.blockedUsersLabel, { color: colors.foreground }]}>Blocked Users</Text>
              <Text style={[styles.blockedUsersDescription, { color: colors.mutedForeground }]}>
                Manage your blocked list
              </Text>
            </View>
            <View style={[styles.badgeNumber, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.badgeText}>{blockedCount}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Data & Security */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Data & Security</Text>

          <TouchableOpacity style={[styles.dataButton, { borderColor: colors.border }]}>
            <Ionicons name="download" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dataButtonLabel, { color: colors.foreground }]}>Download Your Data</Text>
              <Text style={[styles.dataButtonDescription, { color: colors.mutedForeground }]}>
                GDPR data export
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={[styles.dataButton, { borderColor: colors.border }]}
            onPress={() => Alert.alert('Delete Account', 'Are you sure? This cannot be undone.')}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dataButtonLabel, { color: '#FF6B6B' }]}>Delete Account</Text>
              <Text style={[styles.dataButtonDescription, { color: colors.mutedForeground }]}>
                Permanently delete your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.primary }]}
          onPress={handleResetPrivacy}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>Reset to Default</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 16,
  },
  visibilityGrid: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  visibilityLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  blockedUsersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  blockedUsersLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  blockedUsersDescription: {
    fontSize: 12,
  },
  badgeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  dataButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dataButtonDescription: {
    fontSize: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginVertical: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
