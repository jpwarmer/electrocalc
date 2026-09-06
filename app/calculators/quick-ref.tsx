import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCableItmQuickRef } from '@/src/engines/quickref';
import { FormCard } from '@/src/components/form/FormCard';
import { colors, fonts, space } from '@/src/theme';

export default function QuickRefScreen() {
  const router = useRouter();
  const { basis, rule, rows } = getCableItmQuickRef();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard title="Referencia rápida cable–ITM">
          <Text style={styles.basis}>{basis}</Text>
          <Text style={styles.rule}>{rule}</Text>
          <Text style={styles.hint}>
            Rango típico de ITM para cada sección comercial. La ITM máxima debe
            cumplir In ≤ Iz.
          </Text>
        </FormCard>

        <View style={styles.tableCard}>
          <View style={[styles.row, styles.head]}>
            <Text style={[styles.cell, styles.headCell, styles.colCable]}>
              Cable
            </Text>
            <Text style={[styles.cell, styles.headCell, styles.colIz]}>
              Iz mono
            </Text>
            <Text style={[styles.cell, styles.headCell, styles.colItm]}>
              ITM típica
            </Text>
          </View>

          {rows.map((row, i) => (
            <View
              key={row.sectionMm2}
              style={[styles.row, i % 2 === 1 && styles.rowAlt]}
            >
              <View style={styles.colCable}>
                <Text style={styles.cableValue}>{row.sectionMm2} mm²</Text>
                <Text style={styles.useText} numberOfLines={1}>
                  {row.typicalUse}
                </Text>
              </View>
              <Text style={[styles.cell, styles.colIz]}>
                {row.izMono} A
              </Text>
              <View style={styles.colItm}>
                <Text style={styles.itmRange}>
                  {row.itmMin}–{row.itmMax} A
                </Text>
                <Text style={styles.itmList} numberOfLines={2}>
                  {row.itmRatings.map((r) => `${r}A`).join(' · ')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Cómo leer la tabla</Text>
          <Text style={styles.noteBody}>
            Ejemplo: cable <Text style={styles.em}>1.5 mm²</Text> → ITM{' '}
            <Text style={styles.em}>6–10 A</Text> (Iz mono 15 A). Cable{' '}
            <Text style={styles.em}>2.5 mm²</Text> → ITM{' '}
            <Text style={styles.em}>16–20 A</Text>.
          </Text>
          <Text style={styles.noteBody}>
            En trifásico la ampacidad Iz es un poco menor; no superes la ITM
            máxima de la fila.
          </Text>
          <Pressable onPress={() => router.push('/calculators/cable-section')}>
            <Text style={styles.link}>Calcular sección según carga →</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/')}>
            <Text style={[styles.link, { marginTop: 6 }]}>
              Calcular termomagnética →
            </Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          Referencia práctica Argentina (Cu PVC 70°C, Mét. B1, 30°C). Verificá
          factores de temperatura, agrupamiento e instalación en cada caso.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: space.md,
    gap: space.md,
    paddingBottom: space.xxl,
  },
  basis: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  rule: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
  },
  tableCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowAlt: {
    backgroundColor: '#F0F7FC',
  },
  head: {
    backgroundColor: '#EEF2F7',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  cell: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  headCell: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colCable: {
    flex: 1.15,
    minWidth: 0,
  },
  colIz: {
    width: 64,
    textAlign: 'center',
  },
  colItm: {
    flex: 1.25,
    minWidth: 0,
  },
  cableValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: '#C2410C',
  },
  useText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  itmRange: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.copper,
  },
  itmList: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 16,
    padding: space.md,
    gap: 8,
  },
  noteTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: '#8A5A12',
  },
  noteBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#7A5A20',
  },
  em: {
    fontFamily: fonts.bodySemi,
    color: '#8A5A12',
  },
  link: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.copper,
    marginTop: 4,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
  },
});
