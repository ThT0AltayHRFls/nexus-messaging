import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { api } from '@/lib/api';

export default function CreateChannelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Channel name is required');
      return;
    }
    setIsCreating(true);
    try {
      const conv = await api.conversations.create({
        type: 'channel',
        name: name.trim(),
        description: description.trim(),
        isPrivate,
      });
      router.replace(`/conversation/${conv.id}` as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create channel');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>New Channel</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isCreating || !name.trim()}>
          {isCreating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.createBtn, { color: name.trim() ? colors.primary : colors.mutedForeground }]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.iconSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
            <Ionicons name="megaphone" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.iconHint, { color: colors.mutedForeground }]}>Tap to add photo</Text>
        </View>

        <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
          Channels are a way to broadcast messages to a large audience. Create a public channel to reach anyone on Nexus.
        </Text>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>CHANNEL NAME</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter channel name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.foreground }]}
              placeholder="What's this channel about?"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
            />
          </View>
        </View>

        <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.switchInfo}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.accent} />
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>Private Channel</Text>
              <Text style={[styles.switchDesc, { color: colors.mutedForeground }]}>
                Only invited users can join
              </Text>
            </View>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFF"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  createBtn: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  body: { padding: 16 },
  iconSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  iconHint: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  sectionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  formCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  field: { padding: 14 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 8 },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  textArea: { height: 80, textAlignVertical: 'top' },
  divider: { height: 1 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, borderWidth: 1, gap: 14,
  },
  switchInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1 },
  switchLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  switchDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
