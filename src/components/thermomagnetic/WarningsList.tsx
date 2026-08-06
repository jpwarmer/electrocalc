import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EngineWarning } from '@/src/engines/types';
import { colors, fonts, radii, space } from '@/src/theme';

type Props = {
  warnings: EngineWarning[];
};

const severityStyle = {
  info: { bg: colors.tealSoft, fg: colors.teal, border: colors.teal },
  warning: { bg: colors.warnSoft, fg: colors.warn, border: colors.warn },
  critical: { bg: colors.dangerSoft, fg: colors.danger, border: colors.danger },
} as const;

export function WarningsList({ warnings }: Props) {
  if (!warnings.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Avisos normativos</Text>
      {warnings.map((w) => {
        const s = severityStyle[w.severity];
        return (
          <View
            key={`${w.code}-${w.message.slice(0, 24)}`}
            style={[styles.item, { backgroundColor: s.bg, borderLeftColor: s.border }]}
          >
            <Text style={[styles.code, { color: s.fg }]}>{w.code}</Text>
            <Text style={[styles.message, { color: colors.ink }]}>{w.message}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  item: {
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: 12,
    gap: 4,
  },
  code: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
