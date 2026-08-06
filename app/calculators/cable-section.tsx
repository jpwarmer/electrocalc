import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import presets from '@/src/data/cable-presets.json';
import {
  calculateCableSection,
  getCableTempOptions,
  getCircuitKinds,
} from '@/src/engines/cable-section';
import type {
  CableInstallationMethodId,
  CircuitKindId,
  CircuitType,
  InsulationType,
} from '@/src/engines/types';
import { CableResultPanel } from '@/src/components/cable/CableResultPanel';
import { ChoiceCard } from '@/src/components/form/ChoiceCard';
import { FormCard } from '@/src/components/form/FormCard';
import { SelectField } from '@/src/components/form/SelectField';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { colors, fonts, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const METHOD_OPTIONS: {
  value: CableInstallationMethodId;
  label: string;
}[] = [
  { value: 'A', label: 'Mét. A · ×0.87 — embutido en pared sin caño' },
  { value: 'B1', label: 'Mét. B1 · ×1.00 — en caño en/sobre pared (base)' },
  { value: 'E', label: 'Mét. E · ×1.40 — al aire libre' },
  { value: 'D', label: 'Mét. D · ×0.90 — enterrado en suelo' },
];

const CIRCUIT_COUNT_OPTIONS = [
  { value: 1, label: '1 circuito — ×1.00 (sin derating)' },
  { value: 2, label: '2 circuitos — ×0.80 (−20%)' },
  { value: 3, label: '3 circuitos — ×0.70 (−30%) · máximo para generales' },
  { value: 4, label: '4 circuitos — ×0.65 (−35%)' },
  { value: 5, label: '5 circuitos — ×0.60 (−40%)' },
  { value: 6, label: '6 o más — ×0.57 (−43%)' },
];

const TEMP_LABELS: Record<number, string> = {
  25: '25°C — fresco',
  30: '30°C — normal (base)',
  35: '35°C — cálido',
  40: '40°C — muy cálido',
  45: '45°C — extremo',
  50: '50°C — industrial',
};

type Preset = (typeof presets.general)[number] | (typeof presets.ev)[number];

export default function CableSectionScreen() {
  const [mode, setMode] = useState<'power' | 'current'>('power');
  const [powerText, setPowerText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [circuitType, setCircuitType] = useState<CircuitType>('single');
  const [fpText, setFpText] = useState('1');
  const [insulation, setInsulation] = useState<InsulationType>('pvc');
  const [circuitKind, setCircuitKind] = useState<CircuitKindId>('other');
  const [ambientTempC, setAmbientTempC] = useState(30);
  const [method, setMethod] = useState<CableInstallationMethodId>('B1');
  const [circuitsInConduit, setCircuitsInConduit] = useState(1);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const kinds = getCircuitKinds();
  const temps = getCableTempOptions(insulation);

  const applyPreset = (load: Preset) => {
    setActivePreset(load.id);
    setMode(load.mode as 'power' | 'current');
    setPowerText(String(load.powerW));
    if ('currentA' in load && load.currentA) {
      setCurrentText(String(load.currentA));
    }
    setFpText(String(load.powerFactor));
    setCircuitType(load.circuitType as CircuitType);
    setCircuitKind(load.circuitKind as CircuitKindId);
  };

  const hasInput =
    mode === 'power' ? parseNum(powerText) > 0 : parseNum(currentText) > 0;

  const result = useMemo(() => {
    if (!hasInput) return null;
    const powerFactor = parseNum(fpText);
    if (powerFactor <= 0) return null;
    return calculateCableSection({
      mode,
      powerW: mode === 'power' ? parseNum(powerText) : undefined,
      currentA: mode === 'current' ? parseNum(currentText) : undefined,
      circuitType,
      powerFactor,
      insulation,
      circuitKind,
      ambientTempC,
      installationMethod: method,
      circuitsInConduit,
    });
  }, [
    hasInput,
    mode,
    powerText,
    currentText,
    circuitType,
    fpText,
    insulation,
    circuitKind,
    ambientTempC,
    method,
    circuitsInConduit,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>COMENZÁ CON UNA CARGA TÍPICA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.presetRow}>
            {presets.general.map((load) => (
              <ChoiceCard
                key={load.id}
                selected={activePreset === load.id}
                title={load.title}
                subtitle={load.subtitle}
                icon={load.icon}
                onPress={() => applyPreset(load)}
                accent={colors.copper}
                accentSoft="#E8F4FC"
                style={styles.presetCard}
              />
            ))}
          </View>
        </ScrollView>

        <Text style={styles.evKicker}>
          CARGA DE AUTO ELÉCTRICO · AEA 90364-7-722
        </Text>
        <View style={styles.evGrid}>
          {presets.ev.map((load) => (
            <ChoiceCard
              key={load.id}
              selected={activePreset === load.id}
              title={load.title}
              subtitle={load.subtitle}
              icon={load.icon}
              onPress={() => applyPreset(load)}
              accent={colors.teal}
              accentSoft="#E8F4FC"
              style={styles.evCard}
            />
          ))}
        </View>

        <FormCard>
          <ToggleGroup
            label="Modo de cálculo"
            value={mode}
            onChange={(v) => {
              setMode(v);
              setActivePreset(null);
            }}
            options={[
              { value: 'power', label: 'Por Potencia (W)' },
              { value: 'current', label: 'Por Corriente (A)' },
            ]}
          />

          {mode === 'power' ? (
            <TextField
              label="Potencia (Watts)"
              value={powerText}
              onChangeText={(t) => {
                setPowerText(t);
                setActivePreset(null);
              }}
              placeholder="Ej: 3500"
            />
          ) : (
            <TextField
              label="Corriente (Amperios)"
              value={currentText}
              onChangeText={(t) => {
                setCurrentText(t);
                setActivePreset(null);
              }}
              placeholder="Ej: 16"
            />
          )}

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
            label="Aislación del cable"
            value={insulation}
            onChange={setInsulation}
            options={[
              { value: 'pvc', label: 'PVC 70°C' },
              { value: 'xlpe', label: 'XLPE 90°C' },
            ]}
          />

          <SelectField
            label="Tipo de circuito (sección mínima AEA)"
            value={circuitKind}
            onChange={setCircuitKind}
            options={kinds.map((k) => ({
              value: k.id as CircuitKindId,
              label: `${k.label}${k.minSectionMm2 ? ` (mín. ${k.minSectionMm2} mm²)` : ''}`,
            }))}
          />

          <SelectField
            label="Factor de Potencia"
            value={fpText}
            onChange={setFpText}
            options={[
              { value: '1', label: '1.0 — resistivo (calefactores, duchas)' },
              { value: '0.85', label: '0.85 — compresores / A·A' },
              { value: '0.8', label: '0.80 — motores industriales' },
            ]}
            hint="También podés ajustar el valor según la carga real."
          />

          <SelectField
            label="Método de Instalación del Cable"
            value={method}
            onChange={setMethod}
            options={METHOD_OPTIONS}
            hint="Afecta la ampacidad del cable — IEC 60364-5-52 / AEA 90364"
          />

          <SelectField
            label="Temperatura Ambiente (°C)"
            value={ambientTempC}
            onChange={setAmbientTempC}
            options={temps.map((t) => ({
              value: t,
              label: TEMP_LABELS[t] ?? `${t}°C`,
            }))}
          />

          <SelectField
            label="Circuitos en la Misma Cañería"
            value={circuitsInConduit}
            onChange={setCircuitsInConduit}
            options={CIRCUIT_COUNT_OPTIONS}
            hint="AEA 90364-7-771: máx. 3 circuitos generales por cañería. Circuitos especiales en cañería propia."
          />
        </FormCard>

        <CableResultPanel result={result} insulation={insulation} />
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
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.inkMuted,
  },
  evKicker: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.teal,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  presetCard: {
    width: 130,
    flex: 0,
  },
  evGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evCard: {
    width: '48%',
    flexGrow: 0,
    flexBasis: '48%',
  },
});
