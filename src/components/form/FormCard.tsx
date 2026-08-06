import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { colors, fonts, radii, space } from '@/src/theme';

type Props = ViewProps & {
  title?: string;
};

export function FormCard({ title = 'Datos de Entrada', children, style, ...rest }: Props) {
  return (
    <View style={[styles.card, style]} {...rest}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: colors.ink,
    marginBottom: space.md,
  },
  body: {
    gap: space.lg,
  },
});
