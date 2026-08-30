import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Server {
  id: number;
  name: string;
  icon: string;
  color: string;
  memberCount: number;
  isOwner: boolean;
  unreadCount: number;
}

const MOCK_SERVERS: Server[] = [
  {
    id: 1,
    name: 'Gaming Crew',
    icon: '🎮',
    color: '#7B5FFA',
    memberCount: 256,
    isOwner: true,
    unreadCount: 3,
  },
  {
    id: 2,
    name: 'Dev Community',
    icon: '💻',
    color: '#00B894',
    memberCount: 1250,
    isOwner: false,
    unreadCount: 12,
  },
  {
    id: 3,
    name: 'Creative Minds',
    icon: '🎨',
    color: '#FF6B6B',
    memberCount: 542,
    isOwner: true,
    unreadCount: 0,
  },
  {
    id: 4,
    name: 'Music Lovers',
    icon: '🎵',
    color: '#FFB84D',
    memberCount: 893,
    isOwner: false,
    unreadCount: 5,
  },
];

export default function ServersMainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [servers, setServers] = useState(MOCK_SERVERS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serverName, setServerName] = useState('');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const handleCreateServer = () => {
    if (!serverName.trim()) {
      Alert.alert('Error', 'Server name is required');
      return;
    }

    const newServer: Server = {
      id: servers.length + 1,
      name: serverName,
      icon: '✨',
      color: '#7B5FFA',
      memberCount: 1,
      isOwner: true,
      unreadCount: 0,
    };

    setServers([...servers, newServer]);
    setServerName('');
    setShowCreateModal(false);
    Alert.alert('Success', 'Server created successfully!');
  };

  const handleServerPress = (server: Server) => {
    setSelectedServer(server);
    router.push(`/server/${server.id}` as any);
  };

  const renderServerItem = ({ item }: { item: Server }) => (
    <TouchableOpacity
      style={[
        styles.serverCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: item.color,
        },
      ]}
      onPress={() => handleServerPress(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.serverIcon,
          { backgroundColor: item.color + '20' },
        ]}
      >
        <Text style={styles.icon}>{item.icon}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.serverInfo}>
        <View>
          <Text style={[styles.serverName, { color: colors.foreground }]}>
            {item.name}
          </Text>
          <View style={styles.serverMeta}>
            <Ionicons name="people" size={12} color={colors.mutedForeground} />
            <Text style={[styles.serverMembers, { color: colors.mutedForeground }]}>
              {item.memberCount.toLocaleString()}
            </Text>
            {item.isOwner && (
              <>
                <Text style={[styles.dot, { color: colors.mutedForeground }]}>•</Text>
                <Text style={[styles.owner, { color: colors.primary }]}>Owner</Text>
              </>
            )}
          </View>
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.indicatorContainer}>
            <View
              style={[
                styles.unreadIndicator,
                { backgroundColor: colors.primary },
              ]}
            />
          </View>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.mutedForeground}
      />
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
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Servers
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {servers.length} servers
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Servers List */}
      <FlatList
        data={servers}
        renderItem={renderServerItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="server-outline" size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No servers yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: colors.mutedForeground },
              ]}
            >
              Create or join a server to get started
            </Text>
          </View>
        }
      />

      {/* Create Server Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Create New Server
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Server Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.secondary,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="My Awesome Server"
                  placeholderTextColor={colors.mutedForeground}
                  value={serverName}
                  onChangeText={setServerName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Server Icon
                </Text>
                <View style={styles.iconGrid}>
                  {['🎮', '💻', '🎨', '🎵', '📚', '⚽', '🍕', '✨'].map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        { backgroundColor: colors.secondary },
                      ]}
                    >
                      <Text style={styles.iconOptionText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.helperText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Servers let you and your friends hang out together. Make yours and start chatting.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButtonModal,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreateServer}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Browse Servers FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            marginBottom: insets.bottom + 20,
          },
        ]}
        onPress={() => router.push('/public-communities' as any)}
      >
        <Ionicons name="compass" size={24} color="#FFF" />
        <Text style={styles.fabText}>Discover</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 12,
  },
  serverIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 28,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  serverInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  serverName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  serverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serverMembers: {
    fontSize: 11,
  },
  dot: {
    fontSize: 12,
  },
  owner: {
    fontSize: 10,
    fontWeight: '600',
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    maxWidth: width - 60,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
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
    fontSize: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: (width - 64) / 4,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionText: {
    fontSize: 32,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonModal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
