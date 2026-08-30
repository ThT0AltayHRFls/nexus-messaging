import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const PRONOUNS_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'Other'];
const THEMES = ['Light', 'Dark', 'Auto'];

export default function ProfileSettingsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [pronouns, setPronouns] = useState('He/Him');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('Auto');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPronounsPicker, setShowPronounsPicker] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatarUrl);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Alert.alert('Success', 'Profile picture updated');
    }
  };

  const handleSaveProfile = async () => {
    // Supabase'e kaydet
    try {
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Profile Picture
          </Text>

          <View style={styles.profilePicContainer}>
            <Image
              source={{ uri: profileImage || 'https://via.placeholder.com/120' }}
              style={styles.profilePic}
            />
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }]}
              onPress={handlePickImage}
            >
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePickImage}
            style={[styles.changePhotoButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              Change Profile Picture
            </Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Basic Information
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
            <TextInput
              style={[
                styles.bioInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {bio.length}/500
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Pronouns</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => setShowPronounsPicker(true)}
            >
              <Text style={[styles.pickerText, { color: colors.foreground }]}>{pronouns}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact & Social */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Contact & Social
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Website</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="url"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={[styles.label, { color: colors.foreground }]}>Social Links</Text>
            {['Twitter', 'Instagram', 'GitHub', 'YouTube'].map((platform) => (
              <View key={platform} style={styles.socialItem}>
                <Ionicons name={platform.toLowerCase() as any} size={20} color={colors.primary} />
                <TextInput
                  style={[styles.socialInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  placeholder={`${platform} username`}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Appearance
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Theme</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => setShowThemePicker(true)}
            >
              <Text style={[styles.pickerText, { color: colors.foreground }]}>{theme}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status & Visibility */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Status & Visibility
          </Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Show Online Status</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Let others know when you're active
              </Text>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: colors.secondary, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Show Activity Status</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Share what you're doing
              </Text>
            </View>
            <Switch
              value={showActivityStatus}
              onValueChange={setShowActivityStatus}
              trackColor={{ false: colors.secondary, true: colors.primary }}
            />
          </View>
        </View>

        {/* Status Text */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Custom Status
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Status Message</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.mutedForeground}
              maxLength={100}
            />
          </View>

          <View style={styles.emojiGrid}>
            {['😀', '😂', '❤️', '🔥', '👍', '🎉', '🚀', '✨'].map((emoji) => (
              <TouchableOpacity key={emoji} style={[styles.emojiButton, { backgroundColor: colors.secondary }]}>
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveProfile}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal visible={showThemePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Choose Theme</Text>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setTheme(t);
                  setShowThemePicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.foreground }]}>{t}</Text>
                {theme === t && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Pronouns Picker Modal */}
      <Modal visible={showPronounsPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Choose Pronouns</Text>
            {PRONOUNS_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setPronouns(p);
                  setShowPronounsPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.foreground }]}>{p}</Text>
                {pronouns === p && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 12,
    right: '30%',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  changePhotoText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 14,
  },
  socialSection: {
    gap: 8,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
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
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  emojiButton: {
    width: '24%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  saveButton: {
    marginHorizontal: 12,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 15,
  },
});
