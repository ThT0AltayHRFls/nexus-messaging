import React, { useState, useCallback } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, username.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarı', 'Hesabınız oluşturuldu. Lütfen giriş yapın.');
      router.replace('/(auth)/login');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Kayıt Hatası', err.message || 'Kayıt sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [email, username, password, confirmPassword, register]);

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
              <Text style={styles.subtitle}>Hesap Oluşturun</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color="#00d4ff" style={styles.icon} />
                  <TextInput
                    placeholder="E-mail"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="#00d4ff" style={styles.icon} />
                  <TextInput
                    placeholder="Kullanıcı Adı"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    style={styles.input}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#00d4ff" style={styles.icon} />
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

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#00d4ff" style={styles.icon} />
                  <TextInput
                    placeholder="Şifre Onayla"
                    placeholderTextColor="#888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#00d4ff"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, isLoading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>KAYIT OL</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.loginText}>
                  Zaten hesabınız var mı? <Text style={styles.loginLink}>Giriş Yapın</Text>
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
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#00d4ff', textAlign: 'center', marginBottom: 25 },
  formContainer: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff',
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 48,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  registerButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
  loginText: { color: '#888', textAlign: 'center', fontSize: 14 },
  loginLink: { color: '#00d4ff', fontWeight: '600' },
});
