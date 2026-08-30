import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        ExpoSplashScreen.hideAsync();
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 2000);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Logo scale animation
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    // Fade in text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Text slide up
    Animated.timing(textSlide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B14' }]}>
      {/* Background gradient effect */}
      <View style={styles.gradient} />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>𝓝</Text>
        </View>

        {/* Logo shine effect */}
        <Animated.View
          style={[
            styles.shine,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </Animated.View>

      {/* Text Content */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: textSlide }],
          },
        ]}
      >
        <Text style={styles.title}>Nexus</Text>
        <Text style={styles.subtitle}>Connect. Communicate. Create.</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View style={[styles.dot, { marginHorizontal: 4 }]} />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B14',
  },
  gradient: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: -height * 0.25,
    left: -width * 0.25,
    backgroundColor: '#7B5FFA',
    borderRadius: height,
    opacity: 0.1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#7B5FFA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B5FFA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Georgia',
  },
  shine: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E8E8FF',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#7878A8',
    letterSpacing: 2,
    fontFamily: 'Inter_400Regular',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7B5FFA',
    marginHorizontal: 4,
  },
});
