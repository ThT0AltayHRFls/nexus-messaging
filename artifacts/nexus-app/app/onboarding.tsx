import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to Nexus',
    description: 'Connect with friends and communities instantly',
    icon: 'chatbubbles',
    color: '#7B5FFA',
    gradient: ['#7B5FFA', '#5B3FC4'],
  },
  {
    id: '2',
    title: 'Create Servers',
    description: 'Build your own servers with channels and roles',
    icon: 'settings',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF5252'],
  },
  {
    id: '3',
    title: 'Voice & Video',
    description: 'Crystal clear voice and video calls',
    icon: 'call',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#44B0AA'],
  },
  {
    id: '4',
    title: 'Privacy First',
    description: 'Your data is encrypted and secure',
    icon: 'shield-checkmark',
    color: '#95E1D3',
    gradient: ['#95E1D3', '#6CC9BD'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item, index }: any) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      {/* Background shimmer effect */}
      <View style={styles.shimmerContainer}>
        {[...Array(3)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.shimmer,
              {
                opacity: new Animated.Value(0.1 + i * 0.05),
              },
            ]}
          />
        ))}
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Ionicons name={item.icon as any} size={80} color="#FFF" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === index ? 32 : 8,
                backgroundColor: i === index ? '#FFF' : 'rgba(255,255,255,0.5)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={scrollViewRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.nextButton,
            { backgroundColor: SLIDES[currentIndex].color },
          ]}
        >
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B14',
  },
  slide: {
    width,
    height: height - 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  shimmerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shimmer: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: '#7878A8',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
