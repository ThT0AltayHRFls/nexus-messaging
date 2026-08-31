import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PERMISSIONS = [
  {
    id: 'camera',
    name: 'Kamera',
    description: 'Fotoğraf ve video çekmek için',
    icon: 'camera',
  },
  {
    id: 'gallery',
    name: 'Galeri',
    description: 'Fotoğraf ve video seçmek için',
    icon: 'images',
  },
  {
    id: 'notifications',
    name: 'Bildirimler',
    description: 'Mesaj bildirimleri için',
    icon: 'notifications',
  },
];

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async (permissionId: string) => {
    try {
      setIsLoading(true);
      let granted = false;

      if (permissionId === 'camera') {
        const result = await ImagePicker.requestCameraPermissionsAsync();
        granted = result.granted;
      } else if (permissionId === 'gallery') {
        const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = result.granted;
      } else if (permissionId === 'notifications') {
        const result = await Notifications.requestPermissionsAsync();
        granted = result.granted;
      }

      setPermissions(prev => ({
        ...prev,
        [permissionId]: granted,
      }));
    } catch (err) {
      console.error('Permission error:', err);
      Alert.alert('Uyarı', 'İzin alınamadı. Ayarlardan manuel olarak verin.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllGranted = PERMISSIONS.every(p => permissions[p.id] === true);

  const handleContinue = () => {
    if (checkAllGranted) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Uyarı', 'Lütfen tüm izinleri verin');
    }
  };

  return (
    <LinearGradient
      colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/file_000000000f9c8210952d7769f2906254.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>İzinler Gerekli</Text>
        <Text style={styles.subtitle}>
          Uygulamayı tam kullanabilmek için izinleri verin
        </Text>

        <View style={styles.permissionsContainer}>
          {PERMISSIONS.map(perm => (
            <View key={perm.id} style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Ionicons name={perm.icon as any} size={24} color="#00d4ff" />
                <View style={styles.textContainer}>
                  <Text style={styles.permissionName}>{perm.name}</Text>
                  <Text style={styles.permissionDesc}>{perm.description}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.permissionButton,
                  permissions[perm.id] && styles.grantedButton,
                ]}
                onPress={() => requestPermission(perm.id)}
                disabled={permissions[perm.id] || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#00d4ff" size="small" />
                ) : (
                  <Ionicons
                    name={permissions[perm.id] ? 'checkmark-circle' : 'add-circle'}
                    size={28}
                    color={permissions[perm.id] ? '#00ff88' : '#00d4ff'}
                  />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !checkAllGranted && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!checkAllGranted || isLoading}
        >
          <Text style={styles.buttonText}>DEVAM ET</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 30 },
  permissionsContainer: { marginBottom: 30 },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  permissionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { marginLeft: 15, flex: 1 },
  permissionName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  permissionDesc: { fontSize: 12, color: '#888' },
  permissionButton: { padding: 5 },
  grantedButton: { opacity: 0.6 },
  continueButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
});
