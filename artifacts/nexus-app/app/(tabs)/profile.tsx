import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAge, setEditAge] = useState(user?.age ? String(user.age) : '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updated = await api.users.updateMe({
        displayName: editName.trim(),
        bio: editBio.trim(),
        age: editAge ? parseInt(editAge) : undefined,
      });
      updateUser(updated);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const asset = result.assets[0];
        const uploaded = await api.upload.file(
          asset.uri,
          'image/jpeg',
          `avatar-${Date.now()}.jpg`
        );
        const updated = await api.users.updateMe({ avatarUrl: uploaded.url });
        updateUser(updated);
      } catch {
        Alert.alert('Error', 'Failed to update avatar');
      }
    }
  };

  const handleSetStatus = () => {
    Alert.prompt(
      'Set Status',
      'Enter your status message',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: async (text: string | undefined) => {
            if (text) {
              try {
                const updated = await api.users.updateStatus({
                  statusText: text,
                  statusType: 'permanent',
                });
                updateUser(updated);
              } catch {}
            }
          },
        },
      ],
      'plain-text',
      user?.statusText || ''
    );
  };

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover gradient */}
      <LinearGradient
        colors={[colors.primary + '60', colors.background]}
        style={[styles.cover, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity style={styles.avatarWrapper} onPress={handleChangeAvatar} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.avatarRing}
          >
            <View style={[styles.avatarInner, { backgroundColor: colors.background }]}>
              <Avatar uri={user.avatarUrl} name={user.displayName} size={80} />
            </View>
          </LinearGradient>
          <View style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.displayName, { color: colors.foreground }]}>{user.displayName}</Text>
        <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user.username}</Text>

        {user.statusText && (
          <TouchableOpacity onPress={handleSetStatus}>
            <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.statusText, { color: colors.foreground }]}>
                {user.statusText}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Profile info */}
      <View style={styles.body}>
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.qaBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={18} color="#FFF" />
            <Text style={styles.qaBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qaBtn, { backgroundColor: colors.secondary }]}
            onPress={handleSetStatus}
          >
            <Ionicons name="happy-outline" size={18} color={colors.foreground} />
            <Text style={[styles.qaBtnText, { color: colors.foreground }]}>Set Status</Text>
          </TouchableOpacity>
        </View>

        {/* Info cards */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user.bio && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{user.bio}</Text>
            </View>
          )}
          {user.age && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{user.age} years old</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="at-circle-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{user.username}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Joined {new Date(user.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long' })}
            </Text>
          </View>
        </View>

        <Text style={[styles.devSignature, { color: colors.mutedForeground + '60' }]}>
          Nexus • by AltayHR
        </Text>
      </View>

      {/* Edit Modal */}
      <Modal visible={isEditing} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {[
              { label: 'Display Name', value: editName, set: setEditName, multiline: false },
              { label: 'Bio', value: editBio, set: setEditBio, multiline: true },
              { label: 'Age', value: editAge, set: setEditAge, multiline: false, keyboardType: 'numeric' },
            ].map((f) => (
              <View key={f.label} style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>{f.label.toUpperCase()}</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                      height: f.multiline ? 80 : 48,
                      textAlignVertical: f.multiline ? 'top' : 'center',
                    },
                  ]}
                  value={f.value}
                  onChangeText={f.set}
                  multiline={f.multiline}
                  keyboardType={(f as any).keyboardType}
                  placeholder={f.label}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  avatarInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  username: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  body: { padding: 16, gap: 16 },
  quickActions: { flexDirection: 'row', gap: 12 },
  qaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  qaBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#25254040',
  },
  infoText: { fontSize: 15, fontFamily: 'Inter_400Regular', flex: 1 },
  devSignature: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  modalCancel: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  modalSave: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  modalBody: { padding: 16 },
  modalField: { marginBottom: 20 },
  modalLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 8 },
  modalInput: { padding: 14, borderWidth: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
});
