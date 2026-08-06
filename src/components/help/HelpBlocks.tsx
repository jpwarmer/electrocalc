import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@/src/theme';

export function HelpText({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

export function HelpBold({ children }: { children: ReactNode }) {
  return <Text style={styles.bold}>{children}</Text>;
}

export function FormulaBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.formulaBox}>
      <Text style={styles.formulaText}>{children}</Text>
    </View>
  );
}

export function FormulaRow({
  label,
  icon,
  formula,
}: {
  label: string;
  icon?: string;
  formula: string;
}) {
  return (
    <View style={styles.formulaRow}>
      <Text style={styles.formulaRowLabel}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
      <Text style={styles.formulaRowCode}>{formula}</Text>
    </View>
  );
}

export function Callout({
  title,
  children,
  tone = 'blue',
}: {
  title: string;
  children: ReactNode;
  tone?: 'blue' | 'green' | 'amber';
}) {
  const toneStyle =
    tone === 'green'
      ? styles.calloutGreen
      : tone === 'amber'
        ? styles.calloutAmber
        : styles.calloutBlue;
  const titleStyle =
    tone === 'green'
      ? styles.calloutTitleGreen
      : tone === 'amber'
        ? styles.calloutTitleAmber
        : styles.calloutTitleBlue;

  return (
    <View style={[styles.callout, toneStyle]}>
      <Text style={[styles.calloutTitle, titleStyle]}>{title}</Text>
      <Text style={styles.calloutBody}>{children}</Text>
    </View>
  );
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function DataTable({
  headers,
  rows,
  emphasizeFirst,
  emphasizeLast,
}: {
  headers: string[];
  rows: (string | number)[][];
  emphasizeFirst?: boolean;
  emphasizeLast?: boolean;
}) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHead]}>
        {headers.map((h) => (
          <Text key={h} style={[styles.tableCell, styles.tableHeadCell]}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View
          key={`${row[0]}-${i}`}
          style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}
        >
          {row.map((cell, j) => (
            <Text
              key={`${i}-${j}`}
              style={[
                styles.tableCell,
                j === 0 && emphasizeFirst && styles.cellEmphFirst,
                j === row.length - 1 && emphasizeLast && styles.cellEmphLast,
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  bold: {
    fontFamily: fonts.bodySemi,
    color: colors.ink,
  },
  formulaBox: {
    backgroundColor: '#E8F4FC',
    borderRadius: 12,
    padding: space.md,
  },
  formulaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.copper,
    textAlign: 'center',
  },
  formulaRow: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 12,
    gap: 4,
  },
  formulaRowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  formulaRowCode: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.copper,
  },
  callout: {
    borderRadius: 12,
    borderWidth: 1,
    padding: space.md,
    gap: 6,
  },
  calloutBlue: {
    backgroundColor: '#E8F4FC',
    borderColor: '#BAE6FD',
  },
  calloutGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  calloutAmber: {
    backgroundColor: '#FFF8E8',
    borderColor: '#E8D4A8',
  },
  calloutTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  calloutTitleBlue: { color: colors.teal },
  calloutTitleGreen: { color: '#15803D' },
  calloutTitleAmber: { color: '#8A5A12' },
  calloutBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  bulletMark: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.copper,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
  },
  tableRowAlt: {
    backgroundColor: '#F0F7FC',
  },
  tableHead: {
    backgroundColor: '#EEF2F7',
  },
  tableCell: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  tableHeadCell: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkMuted,
  },
  cellEmphFirst: {
    fontFamily: fonts.bodySemi,
    color: '#C2410C',
  },
  cellEmphLast: {
    fontFamily: fonts.bodySemi,
    color: colors.copper,
  },
});
