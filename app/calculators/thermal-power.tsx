import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateThermalPower,
  defaultVoltageForCircuit,
  getThermalCoolingPresets,
  getThermalDefaults,
  getThermalHpPresets,
  type ThermalMode,
} from '@/src/engines/thermal-power';
import type { CircuitType } from '@/src/engines/types';
import { FormCard } from '@/src/components/form/FormCard';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { ThermalPowerResultPanel } from '@/src/components/thermal/ThermalPowerResultPanel';
import { colors, fonts, radii, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const defaults = getThermalDefaults();

export default function ThermalPowerScreen() {
  const [mode, setMode] = useState<ThermalMode>('frigorias');
  const [circuitType, setCircuitType] = useState<CircuitType>('single');
  const [valueText, setValueText] = useState('3000');
  const [copText, setCopText] = useState(String(defaults.copCooling));
  const [effText, setEffText] = useState(String(defaults.motorEfficiency));
  const [voltageText, setVoltageText] = useState('220');
  const [fpText, setFpText] = useState(String(defaults.powerFactorMotor));

  const coolingPresets = getThermalCoolingPresets();
  const hpPresets = getThermalHpPresets();

  const result = useMemo(() => {
    if (parseNum(valueText) <= 0) return null;
    return calculateThermalPower({
      mode,
      value: parseNum(valueText),
      cop: parseNum(copText) || defaults.copCooling,
      efficiency: parseNum(effText) || defaults.motorEfficiency,
      circuitType,
      voltageV: parseNum(voltageText) || defaultVoltageForCircuit(circuitType),
      powerFactor: parseNum(fpText) || 1,
    });
  }, [mode, valueText, copText, effText, circuitType, voltageText, fpText]);

  const valueLabel =
    mode === 'frigorias'
      ? 'Frigorías (fg / kcal/h)'
      : mode === 'calorias'
        ? 'Calorías (kcal/h)'
        : 'Potencia (HP)';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard>
          <ToggleGroup
            label="Convertir desde"
            value={mode}
            onChange={(v) => {
              setMode(v);
              if (v === 'hp') {
                setValueText('1');
                setFpText(String(defaults.powerFactorMotor));
              } else {
                setValueText('3000');
                setCopText(
                  String(
                    v === 'calorias'
                      ? defaults.copHeating
                      : defaults.copCooling,
                  ),
                );
                setFpText(String(defaults.powerFactorMotor));
              }
            }}
            options={[
              { value: 'frigorias', label: 'Frigorías' },
              { value: 'calorias', label: 'Calorías' },
              { value: 'hp', label: 'HP' },
            ]}
          />

          <ToggleGroup
            label="Tipo de circuito"
            value={circuitType}
            onChange={(v) => {
              setCircuitType(v);
              setVoltageText(String(defaultVoltageForCircuit(v)));
            }}
            options={[
              { value: 'single', label: 'Mono 220 V' },
              { value: 'three', label: 'Tri 380 V' },
            ]}
          />

          <TextField
            label={valueLabel}
            value={valueText}
            onChangeText={setValueText}
            placeholder={mode === 'hp' ? 'Ej: 1.5' : 'Ej: 3000'}
            hint={
              mode === 'hp'
                ? 'Potencia mecánica del motor (placa).'
                : 'Capacidad térmica del equipo (no confundir con watts).'
            }
          />

          {mode === 'hp' ? (
            <TextField
              label="Rendimiento del motor (η)"
              value={effText}
              onChangeText={setEffText}
              hint="Típico 0.80–0.90. Si no está en placa, usá 0.85."
            />
          ) : (
            <TextField
              label="COP / eficiencia"
              value={copText}
              onChangeText={setCopText}
              hint="COP típico A·A: 2.5–3.5. Mayor COP = menos consumo eléctrico."
            />
          )}

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
            hint="Motores / A·A ≈ 0.85 · resistivo = 1.0"
          />

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>
              {mode === 'hp' ? 'Motores típicos' : 'Aires típicos (fg)'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.examplesRow}
            >
              {mode === 'hp'
                ? hpPresets.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.exampleCard}
                      onPress={() => {
                        setMode('hp');
                        setValueText(String(p.hp));
                        setEffText(String(p.efficiency));
                        setFpText(String(defaults.powerFactorMotor));
                      }}
                    >
                      <Text style={styles.exampleTitle} numberOfLines={2}>
                        {p.label}
                      </Text>
                      <Text style={styles.exampleMeta}>
                        η {p.efficiency.toFixed(2)}
                      </Text>
                    </Pressable>
                  ))
                : coolingPresets.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.exampleCard}
                      onPress={() => {
                        setMode('frigorias');
                        setValueText(String(p.frigorias));
                        setCopText(String(p.cop));
                        setFpText(String(defaults.powerFactorMotor));
                        setCircuitType('single');
                        setVoltageText('220');
                      }}
                    >
                      <Text style={styles.exampleTitle} numberOfLines={2}>
                        {p.label}
                      </Text>
                      <Text style={styles.exampleMeta}>COP {p.cop}</Text>
                    </Pressable>
                  ))}
            </ScrollView>
          </View>
        </FormCard>

        <ThermalPowerResultPanel
          result={result}
          mode={mode}
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
  examplesRow: {
    gap: 10,
    paddingRight: space.md,
  },
  exampleCard: {
    width: 140,
    minHeight: 78,
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
    lineHeight: 17,
    color: colors.ink,
    marginBottom: 6,
  },
  exampleMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
  },
});
