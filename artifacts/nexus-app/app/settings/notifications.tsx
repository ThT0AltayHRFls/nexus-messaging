import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [silentHoursEnabled, setSilentHoursEnabled] = useState(false);
  const [silentStart, setSilentStart] = useState('23:00');
  const [silentEnd, setSilentEnd] = useState('08:00');
  const [notifyFriends, setNotifyFriends] = useState(true);
  const [notifyAll, setNotifyAll] = useState(true);

  const SettingRow = ({ label, description, value, onChange, disabled = false }: any) => (
    <View
      style={[
        styles.settingRow,
        disabled && { opacity: 0.5 },
      ]}
    >
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
        disabled={disabled}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* General */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Notification Types
          </Text>

          <SettingRow
            label="Push Notifications"
            description="Receive notifications on your device"
            value={pushEnabled}
            onChange={setPushEnabled}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Email Notifications"
            description="Get important updates via email"
            value={emailEnabled}
            onChange={setEmailEnabled}
          />
        </View>

        {/* Sound & Vibration */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Sound & Vibration
          </Text>

          <SettingRow
            label="Sound"
            description="Play notification sounds"
            value={soundEnabled}
            onChange={setSoundEnabled}
            disabled={!pushEnabled}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Vibration"
            description="Vibrate on notifications"
            value={vibrationEnabled}
            onChange={setVibrationEnabled}
            disabled={!pushEnabled}
          />

          {/* Sound Selection */}
          {soundEnabled && (
            <TouchableOpacity
              style={[
                styles.soundButton,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Ionicons name="volume-high" size={18} color={colors.primary} />
              <Text style={[styles.soundLabel, { color: colors.foreground }]}>
                Notification Sound: Default
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Silent Hours */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Silent Hours
          </Text>

          <SettingRow
            label="Enable Silent Hours"
            description="Mute notifications during specific times"
            value={silentHoursEnabled}
            onChange={setSilentHoursEnabled}
          />

          {silentHoursEnabled && (
            <View style={styles.timeRangeContainer}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: colors.foreground }]}>From</Text>
                <TextInput
                  style={[
                    styles.timeField,
                    { backgroundColor: colors.secondary, color: colors.foreground },
                  ]}
                  value={silentStart}
                  onChangeText={setSilentStart}
                  placeholder="23:00"
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: colors.foreground }]}>To</Text>
                <TextInput
                  style={[
                    styles.timeField,
                    { backgroundColor: colors.secondary, color: colors.foreground },
                  ]}
                  value={silentEnd}
                  onChangeText={setSilentEnd}
                  placeholder="08:00"
                />
              </View>
            </View>
          )}
        </View>

        {/* Message Notifications */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Message Notifications
          </Text>

          <SettingRow
            label="All Messages"
            description="Notify for every message"
            value={notifyAll}
            onChange={setNotifyAll}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            label="Friends Only"
            description="Only notify from friends"
            value={notifyFriends}
            onChange={setNotifyFriends}
          />

          {/* Muted Words */}
          <View style={styles.mutedWordsSection}>
            <Text style={[styles.mutedWordsLabel, { color: colors.foreground }]}>
              Muted Words
            </Text>
            <TextInput
              style={[
                styles.mutedWordsInput,
                { backgroundColor: colors.secondary, color: colors.foreground },
              ]}
              placeholder="word1, word2, word3..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
            />
            <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
              Notifications containing these words will be muted
            </Text>
          </View>
        </View>

        {/* Server & Channel Notifications */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Server Notifications
          </Text>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.serverName, { color: colors.foreground }]}>
                Gaming Crew
              </Text>
              <Text style={[styles.notificationStatus, { color: colors.mutedForeground }]}>
                All messages
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.serverName, { color: colors.foreground }]}>
                Dev Community
              </Text>
              <Text style={[styles.notificationStatus, { color: colors.mutedForeground }]}>
                Mentions only
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.serverName, { color: colors.foreground }]}>
                Creative Minds
              </Text>
              <Text style={[styles.notificationStatus, { color: colors.mutedForeground }]}>
                Nothing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Keywords */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Keywords & Mentions
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
            Always notify when mentioned or when these keywords are used
          </Text>

          <TextInput
            style={[
              styles.keywordInput,
              { backgroundColor: colors.secondary, color: colors.foreground },
            ]}
            placeholder="keyword1, keyword2..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={() => Alert.alert('Reset', 'Reset to default notification settings?')}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={[styles.resetText, { color: colors.foreground }]}>
            Reset Notification Settings
          </Text>
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
    marginBottom: 12,
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
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  soundLabel: {
    flex: 1,
    fontSize: 14,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeField: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  mutedWordsSection: {
    marginTop: 12,
  },
  mutedWordsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  mutedWordsInput: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationStatus: {
    fontSize: 12,
  },
  keywordInput: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
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
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
