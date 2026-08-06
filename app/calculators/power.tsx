import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculatePower,
  defaultVoltage,
  getPowerAppliances,
} from '@/src/engines/power';
import type { PowerCircuitKind, PowerSolveFor } from '@/src/engines/types';
import { FormCard } from '@/src/components/form/FormCard';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { PowerResultPanel } from '@/src/components/power/PowerResultPanel';
import { colors, fonts, radii, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const CIRCUIT_LABEL: Record<PowerCircuitKind, string> = {
  dc: 'DC (corriente continua)',
  ac_single: 'AC monofásico 220 V',
  ac_three: 'AC trifásico 380 V',
};

export default function PowerScreen() {
  const [circuitKind, setCircuitKind] = useState<PowerCircuitKind>('ac_single');
  const [solveFor, setSolveFor] = useState<PowerSolveFor>('current');
  const [powerText, setPowerText] = useState('2200');
  const [voltageText, setVoltageText] = useState('220');
  const [currentText, setCurrentText] = useState('10');
  const [fpText, setFpText] = useState('1');

  const appliances = getPowerAppliances();

  const result = useMemo(() => {
    return calculatePower({
      circuitKind,
      solveFor,
      powerW: parseNum(powerText),
      voltageV: parseNum(voltageText),
      currentA: parseNum(currentText),
      powerFactor: parseNum(fpText) || 1,
    });
  }, [circuitKind, solveFor, powerText, voltageText, currentText, fpText]);

  const hasMeaningfulInput = (() => {
    if (solveFor === 'power') {
      return parseNum(voltageText) > 0 && parseNum(currentText) > 0;
    }
    if (solveFor === 'voltage') {
      return parseNum(powerText) > 0 && parseNum(currentText) > 0;
    }
    return parseNum(powerText) > 0 && parseNum(voltageText) > 0;
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard>
          <ToggleGroup
            label="Tipo de circuito"
            value={circuitKind}
            onChange={(v) => {
              setCircuitKind(v);
              setVoltageText(String(defaultVoltage(v)));
            }}
            options={[
              { value: 'dc', label: 'DC' },
              { value: 'ac_single', label: 'AC mono 220 V' },
              { value: 'ac_three', label: 'AC tri 380 V' },
            ]}
          />

          <ToggleGroup
            label="¿Qué querés calcular?"
            value={solveFor}
            onChange={setSolveFor}
            options={[
              { value: 'current', label: 'Corriente (A)' },
              { value: 'power', label: 'Potencia (W)' },
              { value: 'voltage', label: 'Voltaje (V)' },
            ]}
          />

          {solveFor !== 'power' ? (
            <TextField
              label="Potencia (Watts)"
              value={powerText}
              onChangeText={setPowerText}
              placeholder="Ej: 2200"
            />
          ) : null}

          {solveFor !== 'voltage' ? (
            <TextField
              label="Voltaje (V)"
              value={voltageText}
              onChangeText={setVoltageText}
              placeholder={
                circuitKind === 'dc'
                  ? 'Ej: 12'
                  : circuitKind === 'ac_three'
                    ? 'Ej: 380'
                    : 'Ej: 220'
              }
              hint={
                circuitKind === 'ac_single'
                  ? 'Tensión doméstica típica Argentina: 220 V'
                  : circuitKind === 'ac_three'
                    ? 'Tensión industrial típica Argentina: 380 V'
                    : undefined
              }
            />
          ) : null}

          {solveFor !== 'current' ? (
            <TextField
              label="Corriente (A)"
              value={currentText}
              onChangeText={setCurrentText}
              placeholder="Ej: 10"
            />
          ) : null}

          {circuitKind !== 'dc' ? (
            <TextField
              label="Factor de Potencia (cos φ)"
              value={fpText}
              onChangeText={setFpText}
              hint="1.0 resistivo · 0.85–0.90 motores · 0.6–0.7 fluorescentes"
            />
          ) : null}

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Electrodomésticos (220 V)</Text>
            <Text style={styles.examplesHint}>
              En aires, los watts son consumo eléctrico, no frigorías.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.examplesRow}
            >
              {appliances.map((a) => {
                const amps = a.powerW / (220 * a.fp);
                return (
                  <Pressable
                    key={a.id}
                    style={styles.exampleCard}
                    onPress={() => {
                      setCircuitKind('ac_single');
                      setSolveFor('current');
                      setPowerText(String(a.powerW));
                      setVoltageText('220');
                      setFpText(String(a.fp));
                    }}
                  >
                    <Text style={styles.exampleTitle}>{a.label}</Text>
                    <Text style={styles.exampleMeta}>
                      {a.powerW} W → {amps.toFixed(1)} A
                    </Text>
                    {a.fp < 1 ? (
                      <Text style={styles.exampleFp}>FP {a.fp}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </FormCard>

        <PowerResultPanel
          result={hasMeaningfulInput || result.error ? result : null}
          solveFor={solveFor}
          circuitKind={circuitKind}
          circuitLabel={CIRCUIT_LABEL[circuitKind]}
          powerFactor={circuitKind === 'dc' ? 1 : parseNum(fpText) || 1}
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
  examplesHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 16,
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
  exampleFp: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.teal,
    marginTop: 4,
  },
});
