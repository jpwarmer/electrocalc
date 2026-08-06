import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateVoltageDropStandalone,
  getVoltageDropSections,
} from '@/src/engines/voltage-drop';
import type { CircuitType, ConductorMaterial } from '@/src/engines/types';
import { FormCard } from '@/src/components/form/FormCard';
import { SelectField } from '@/src/components/form/SelectField';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { VoltageDropResultPanel } from '@/src/components/voltage-drop/VoltageDropResultPanel';
import { colors, fonts, radii, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const EXAMPLES = [
  { label: 'Iluminación', powerW: 500, lengthM: 15, section: 1.5 },
  { label: 'Tomacorrientes', powerW: 2200, lengthM: 20, section: 2.5 },
  { label: 'Aire acond.', powerW: 3500, lengthM: 10, section: 2.5 },
  { label: 'Taller', powerW: 5000, lengthM: 30, section: 6 },
];

export default function VoltageDropScreen() {
  const [circuitType, setCircuitType] = useState<CircuitType>('single');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [mode, setMode] = useState<'power' | 'current'>('power');
  const [powerText, setPowerText] = useState('2200');
  const [currentText, setCurrentText] = useState('10');
  const [lengthText, setLengthText] = useState('20');
  const [section, setSection] = useState(2.5);
  const [fpText, setFpText] = useState('1');
  const [limit, setLimit] = useState<3 | 5>(3);

  const sections = getVoltageDropSections();

  const hasInput =
    mode === 'power' ? parseNum(powerText) > 0 : parseNum(currentText) > 0;

  const result = useMemo(() => {
    if (!hasInput) return null;
    const powerFactor = parseNum(fpText);
    if (powerFactor <= 0) return null;
    return calculateVoltageDropStandalone({
      mode,
      powerW: mode === 'power' ? parseNum(powerText) : undefined,
      currentA: mode === 'current' ? parseNum(currentText) : undefined,
      circuitType,
      material,
      lengthM: parseNum(lengthText),
      sectionMm2: section,
      powerFactor,
      limitPercent: limit,
    });
  }, [
    hasInput,
    mode,
    powerText,
    currentText,
    circuitType,
    material,
    lengthText,
    section,
    fpText,
    limit,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard>
          <ToggleGroup
            label="Tipo de Circuito"
            value={circuitType}
            onChange={setCircuitType}
            options={[
              { value: 'single', label: 'Monofásico 220 V' },
              { value: 'three', label: 'Trifásico 380 V' },
            ]}
          />

          <ToggleGroup
            label="Material del conductor"
            value={material}
            onChange={setMaterial}
            options={[
              { value: 'copper', label: 'Cobre' },
              { value: 'aluminum', label: 'Aluminio' },
            ]}
          />

          <ToggleGroup
            label="Modo de cálculo"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'power', label: 'Por Potencia (W)' },
              { value: 'current', label: 'Por Corriente (A)' },
            ]}
          />

          {mode === 'power' ? (
            <TextField
              label="Potencia (Watts)"
              value={powerText}
              onChangeText={setPowerText}
              placeholder="Ej: 2200"
            />
          ) : (
            <TextField
              label="Corriente (Amperios)"
              value={currentText}
              onChangeText={setCurrentText}
              placeholder="Ej: 10"
            />
          )}

          <TextField
            label="Longitud del cable (m)"
            value={lengthText}
            onChangeText={setLengthText}
            placeholder="20"
            hint="Distancia desde el tablero hasta la carga (un sentido)."
          />

          <View style={styles.row}>
            <SelectField
              label="Sección (mm²)"
              value={section}
              onChange={setSection}
              options={sections.map((s) => ({
                value: s,
                label: `${s} mm²`,
              }))}
            />
            <TextField
              label="Factor de Potencia"
              value={fpText}
              onChangeText={setFpText}
              hint="1.0 resist. · 0.85 A/A · 0.80 motores"
            />
          </View>

          <SelectField
            label="Límite AEA 90364"
            value={limit}
            onChange={setLimit}
            options={[
              { value: 3, label: '3% — iluminación / tomacorrientes' },
              { value: 5, label: '5% — motores / caída total' },
            ]}
            hint="Circuitos terminales típicos: 3%. Motores o suma total: 5%."
          />

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Ejemplos típicos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.examplesRow}
            >
              {EXAMPLES.map((ex) => (
                <Pressable
                  key={ex.label}
                  style={styles.exampleCard}
                  onPress={() => {
                    setMode('power');
                    setPowerText(String(ex.powerW));
                    setLengthText(String(ex.lengthM));
                    setSection(ex.section);
                    setFpText('1');
                    setCircuitType('single');
                    setMaterial('copper');
                    setLimit(3);
                  }}
                >
                  <Text style={styles.exampleTitle}>{ex.label}</Text>
                  <Text style={styles.exampleMeta}>
                    {ex.powerW} W · {ex.lengthM} m · {ex.section} mm²
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </FormCard>

        <VoltageDropResultPanel
          result={result}
          sectionMm2={section}
          lengthM={parseNum(lengthText)}
          materialLabel={material === 'copper' ? 'Cobre' : 'Aluminio'}
          circuitLabel={
            circuitType === 'single' ? 'Monofásico 220 V' : 'Trifásico 380 V'
          }
          circuitType={circuitType}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.md, gap: space.md, paddingBottom: space.xxl },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  examples: { gap: space.sm },
  examplesTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  examplesRow: {
    gap: 10,
    paddingRight: space.md,
  },
  exampleCard: {
    width: 168,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.copper,
  },
  exampleTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 6,
  },
  exampleMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
