import React, { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@/src/theme';

export function useResultReveal(dep: unknown) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(10);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dep, fade, slide]);

  return { fade, slide };
}

export function ResultEmpty({
  message,
  error,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <View style={[styles.empty, error && styles.errorBox]}>
      <Text style={styles.sectionTitle}>Resultado</Text>
      <Text style={error ? styles.errorText : styles.emptyText}>{message}</Text>
    </View>
  );
}

export function ResultHead() {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.sectionTitle}>Resultado</Text>
    </View>
  );
}

export function ResultReveal({
  children,
  dep,
}: {
  children: ReactNode;
  dep: unknown;
}) {
  const { fade, slide } = useResultReveal(dep);
  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

export function HeroCard({
  label,
  value,
  meta,
  children,
  compact,
}: {
  label: string;
  value: string;
  meta?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>{label}</Text>
      <Text style={[styles.heroValue, compact && styles.heroValueCompact]}>
        {value}
      </Text>
      {meta ? <Text style={styles.heroMeta}>{meta}</Text> : null}
      {children}
    </View>
  );
}

export function DetailCard({ children }: { children: ReactNode }) {
  return <View style={styles.detailCard}>{children}</View>;
}

export function WarnCard({
  title = '⚠ Advertencias',
  items,
}: {
  title?: string;
  items: { key: string; message: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.warnCard}>
      <Text style={styles.warnTitle}>{title}</Text>
      {items.map((w) => (
        <Text key={w.key} style={styles.warnItem}>
          • {w.message}
        </Text>
      ))}
    </View>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function NormFooter({ lines }: { lines: string[] }) {
  return (
    <View style={styles.footer}>
      {lines.map((line) => (
        <Text key={line} style={styles.footerText}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export const resultText = StyleSheet.create({
  coord: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
  legend: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    lineHeight: 16,
  },
  detailTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: '#8A5A12',
  },
  detailBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#7A5A20',
  },
  detailMuted: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: '#9A6700',
  },
  infoBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  infoHero: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.ink,
    marginTop: 2,
  },
  infoLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.copper,
    marginTop: 2,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.danger,
  },
});

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  check: {
    color: colors.ok,
    fontSize: 18,
    fontFamily: fonts.bodySemi,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: colors.ink,
  },
  empty: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    padding: space.lg,
    gap: 8,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  errorBox: {
    borderStyle: 'solid',
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.danger,
  },
  heroCard: {
    backgroundColor: '#E8F4FC',
    borderRadius: 16,
    padding: space.lg,
    gap: 4,
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.teal,
  },
  heroValue: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    color: colors.copper,
    letterSpacing: 0.5,
  },
  heroValueCompact: {
    fontSize: 28,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.ink,
  },
  statHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
  },
  detailCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 16,
    padding: space.md,
    gap: 6,
  },
  warnCard: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 16,
    padding: space.md,
    gap: 8,
  },
  warnTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.danger,
  },
  warnItem: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#7F1D1D',
  },
  infoCard: {
    backgroundColor: '#EEF2F7',
    borderRadius: 16,
    padding: space.md,
    gap: 4,
  },
  infoTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  footer: {
    gap: 6,
    paddingHorizontal: 4,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
  },
});

export const resultLayout = {
  statsRow: styles.statsRow,
};
