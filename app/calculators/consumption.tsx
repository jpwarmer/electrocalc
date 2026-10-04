import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateConsumption,
  defaultVoltage,
  type UsagePeriod,
} from '@/src/engines/consumption';
import type { CircuitType } from '@/src/engines/types';
import { FormCard } from '@/src/components/form/FormCard';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { ConsumptionResultPanel } from '@/src/components/consumption/ConsumptionResultPanel';
import { colors, fonts, radii, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const HOUR_PRESETS_DAY = [
  { label: '1 h/día', hours: 1 },
  { label: '2 h/día', hours: 2 },
  { label: '4 h/día', hours: 4 },
  { label: '8 h/día', hours: 8 },
  { label: '24 h', hours: 24 },
];

const HOUR_PRESETS_WEEK = [
  { label: '7 h/sem', hours: 7 },
  { label: '14 h/sem', hours: 14 },
  { label: '28 h/sem', hours: 28 },
  { label: '56 h/sem', hours: 56 },
];

export default function ConsumptionScreen() {
  const [circuitType, setCircuitType] = useState<CircuitType>('single');
  const [currentText, setCurrentText] = useState('6');
  const [hoursText, setHoursText] = useState('2');
  const [period, setPeriod] = useState<UsagePeriod>('day');
  const [voltageText, setVoltageText] = useState('220');
  const [fpText, setFpText] = useState('1');
  const [daysText, setDaysText] = useState('30');

  const result = useMemo(() => {
    if (parseNum(currentText) <= 0) return null;
    return calculateConsumption({
      currentA: parseNum(currentText),
      hours: parseNum(hoursText),
      period,
      circuitType,
      voltageV: parseNum(voltageText) || defaultVoltage(circuitType),
      powerFactor: parseNum(fpText) || 1,
      daysPerMonth: parseNum(daysText) || 30,
    });
  }, [
    currentText,
    hoursText,
    period,
    circuitType,
    voltageText,
    fpText,
    daysText,
  ]);

  const presets = period === 'day' ? HOUR_PRESETS_DAY : HOUR_PRESETS_WEEK;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard>
          <ToggleGroup
            label="Tipo de circuito"
            value={circuitType}
            onChange={(v) => {
              setCircuitType(v);
              setVoltageText(String(defaultVoltage(v)));
            }}
            options={[
              { value: 'single', label: 'Mono 220 V' },
              { value: 'three', label: 'Tri 380 V' },
            ]}
          />

          <TextField
            label="Corriente medida (A)"
            value={currentText}
            onChangeText={setCurrentText}
            placeholder="Ej: 6"
            hint="Valor de la pinza amperométrica o instrumento."
          />

          <ToggleGroup
            label="Uso medido en"
            value={period}
            onChange={(v) => {
              setPeriod(v);
              setHoursText(v === 'day' ? '2' : '14');
            }}
            options={[
              { value: 'day', label: 'Horas / día' },
              { value: 'week', label: 'Horas / semana' },
            ]}
          />

          <TextField
            label={period === 'day' ? 'Horas por día' : 'Horas por semana'}
            value={hoursText}
            onChangeText={setHoursText}
            placeholder={period === 'day' ? 'Ej: 2' : 'Ej: 14'}
            hint={
              period === 'day'
                ? 'Máximo 24 h. Ej.: se enciende 2 horas cada día.'
                : 'Máximo 168 h. Útil si no se usa todos los días.'
            }
          />

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Uso típico</Text>
            <View style={styles.chips}>
              {presets.map((p) => {
                const active = parseNum(hoursText) === p.hours;
                return (
                  <Pressable
                    key={p.label}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setHoursText(String(p.hours))}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label="Voltaje (V)"
            value={voltageText}
            onChangeText={setVoltageText}
            placeholder="220"
          />

          <TextField
            label="Factor de potencia (cos φ)"
            value={fpText}
            onChangeText={setFpText}
            hint="1.0 resistivo · 0.85 motores / A·A. Si no sabés, usá 1."
          />

          <TextField
            label="Días del mes"
            value={daysText}
            onChangeText={setDaysText}
            placeholder="30"
            hint="Para estimar el período de facturación (por defecto 30)."
          />
        </FormCard>

        <ConsumptionResultPanel
          result={result}
          circuitLabel={
            circuitType === 'single'
              ? 'Monofásico 220 V'
              : 'Trifásico 380 V'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.md, gap: space.md, paddingBottom: space.xxl },
  examples: { gap: space.sm },
  examplesTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: {
    borderColor: colors.copper,
    backgroundColor: colors.tealSoft,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.teal,
    fontFamily: fonts.bodySemi,
  },
});
