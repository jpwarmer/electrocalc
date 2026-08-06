import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@/src/theme';

type Props = {
  selected: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
  accent?: string;
  accentSoft?: string;
  icon?: string;
  style?: object;
};

export function ChoiceCard({
  selected,
  title,
  subtitle,
  onPress,
  accent = colors.copper,
  accentSoft = colors.tealSoft,
  icon,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        selected && {
          borderColor: accent,
          backgroundColor: accentSoft,
        },
        style,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.title, selected && { color: accent }]}>{title}</Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    padding: 12,
    gap: 4,
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 16,
  },
});
