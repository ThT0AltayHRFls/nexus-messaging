import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface FeatureWidgetProps {
  icon: string;
  title: string;
  description: string;
  tint?: string;
}

export default function FeatureWidget({
  icon,
  title,
  description,
  tint,
}: FeatureWidgetProps) {
  const colors = useColors();
  const accent = tint || colors.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${accent}20` }]}>
        <Ionicons name={icon as any} size={22} color={accent} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: 166,
    padding: 15,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
});