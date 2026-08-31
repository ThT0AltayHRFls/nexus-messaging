import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [googleRequest, , promptGoogleAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', err.message || 'Geçersiz kimlik bilgileri');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    if (!googleRequest) {
      Alert.alert('Dikkat', 'Google Client ID doğru yapılandırılmamış');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await promptGoogleAsync();
      if (result.type === 'success') {
        const idToken = result.params?.id_token;
        if (!idToken) throw new Error('Token alınamadı');
        await loginWithGoogle(idToken);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Google Hatası', err?.message || 'Lütfen tekrar deneyin');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [googleRequest, loginWithGoogle, promptGoogleAsync]);

  return (
    <ImageBackground
      source={require('../../assets/1000067245.png')}
      style={styles.background}
    >
      <LinearGradient
        colors={['rgba(10,14,39,0.3)', 'rgba(26,31,58,0.4)']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
              <Image
                source={require('../../assets/file_000000000f9c8210952d7769f2906254.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>NEXUS MESSAGE</Text>
              <Text style={styles.subtitle}>Güvenli Mesajlaşma</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="#00d4ff" style={styles.icon} />
                  <TextInput
                    placeholder="Kullanıcı Adı"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock" size={20} color="#00d4ff" style={styles.icon} />
                  <TextInput
                    placeholder="Şifre"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#00d4ff"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>GİRİŞ YAP</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>VEYA</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, isGoogleLoading && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading || !googleRequest}
              >
                <Image
                  source={require('../../assets/1000067247.png')}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerText}>
                  Hesabınız yok mu? <Text style={styles.registerLink}>Kayıt Olun</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#00d4ff', textAlign: 'center', marginBottom: 30 },
  formContainer: { marginBottom: 30 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff',
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  loginButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  googleLogo: { width: '100%', height: '100%' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#00d4ff' },
  dividerText: { color: '#00d4ff', marginHorizontal: 10, fontWeight: '600' },
  registerText: { color: '#888', textAlign: 'center', fontSize: 14, marginTop: 20 },
  registerLink: { color: '#00d4ff', fontWeight: '600' },
});
