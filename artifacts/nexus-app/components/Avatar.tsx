import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const BG_COLORS = [
  '#7B5FFA', '#00C8FF', '#FF3B5C', '#4ADE80',
  '#FFBB00', '#FF7A00', '#9B5FFA', '#00B4D8',
];

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  isOnline?: boolean;
  borderColor?: string;
}

export default function Avatar({
  uri,
  name,
  size = 44,
  isOnline,
  borderColor = '#0B0B14',
}: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const bg = BG_COLORS[(name.charCodeAt(0) || 0) % BG_COLORS.length];
  const dotSize = Math.round(size * 0.28);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
          ]}
        >
          <Text
            style={[styles.initials, { fontSize: Math.round(size * 0.36) }]}
          >
            {initials || '?'}
          </Text>
        </View>
      )}
      {isOnline && (
        <View
          style={[
            styles.online,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: Math.max(2, Math.round(size * 0.06)),
              borderColor,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
  },
  online: {
    position: 'absolute',
    backgroundColor: '#4ADE80',
  },
});
