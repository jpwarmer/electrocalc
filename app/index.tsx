import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  calculateThermomagnetic,
  getTemperatureOptions,
} from '@/src/engines/thermomagnetic';
import type {
  CalculationMode,
  CircuitType,
  InstallationMethodId,
  LoadType,
} from '@/src/engines/types';
import { FormCard } from '@/src/components/form/FormCard';
import { SelectField } from '@/src/components/form/SelectField';
import { TextField } from '@/src/components/form/TextField';
import { ToggleGroup } from '@/src/components/form/ToggleGroup';
import { ResultPanel } from '@/src/components/thermomagnetic/ResultPanel';
import { TypicalLoads } from '@/src/components/thermomagnetic/TypicalLoads';
import { calculatorHeaderOptions } from '@/src/navigation/header';
import { colors, space } from '@/src/theme';

function parseNum(text: string): number {
  const n = Number(String(text).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const TEMP_LABELS: Record<number, { summary: string; label: string }> = {
  25: { summary: '25°C — fresco', label: '25°C — fresco' },
  30: {
    summary: '30°C — normal',
    label: '30°C — normal (base IEC 60898)',
  },
  35: { summary: '35°C — cálido', label: '35°C — cálido' },
  40: {
    summary: '40°C — muy cálido',
    label: '40°C — muy cálido (tablero interior verano)',
  },
  45: {
    summary: '45°C — extremo',
    label: '45°C — extremo (tablero exterior NOA/NEA)',
  },
  50: {
    summary: '50°C — industrial',
    label: '50°C — ambiente industrial caluroso',
  },
};

const LOAD_OPTIONS: {
  value: LoadType;
  summary: string;
  label: string;
}[] = [
  {
    value: 'resistive',
    summary: 'Resistiva',
    label: 'Resistiva — iluminación, calefactores, termotanque, ducha',
  },
  {
    value: 'inductive',
    summary: 'Inductiva',
    label: 'Inductiva — aire acondicionado, heladera, lavarropas',
  },
  {
    value: 'motor',
    summary: 'Motor',
    label: 'Motor — bombas, compresores, herramientas eléctricas',
  },
  {
    value: 'inverter',
    summary: 'Inverter / EV',
    label: 'Inverter / Cargador EV / Bomba de calor',
  },
];

const CIRCUIT_COUNT_OPTIONS = [
  {
    value: 1,
    summary: '1 circuito — ×1.00',
    label: '1 circuito — ×1.00 (sin derating)',
  },
  { value: 2, summary: '2 circuitos — ×0.80', label: '2 circuitos — ×0.80' },
  {
    value: 3,
    summary: '3 circuitos — ×0.70',
    label: '3 circuitos — ×0.70 · máx. para circuitos generales',
  },
  { value: 4, summary: '4 circuitos — ×0.65', label: '4 circuitos — ×0.65' },
  { value: 5, summary: '5 circuitos — ×0.60', label: '5 circuitos — ×0.60' },
  {
    value: 6,
    summary: '6 o más — ×0.57',
    label: '6 o más — ×0.57',
  },
];

export default function ThermomagneticHomeScreen() {
  const [mode, setMode] = useState<CalculationMode>('power');
  const [powerText, setPowerText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [circuitType, setCircuitType] = useState<CircuitType>('single');
  const [powerFactorText, setPowerFactorText] = useState('1.0');
  const [loadType, setLoadType] = useState<LoadType>('resistive');
  const [ambientTempC, setAmbientTempC] = useState(30);
  const [installationMethod, setInstallationMethod] =
    useState<InstallationMethodId>('B1');
  const [circuitsInConduit, setCircuitsInConduit] = useState(1);
  const [lengthText, setLengthText] = useState('15');
  const [distanceText, setDistanceText] = useState('5');

  const temps = getTemperatureOptions();

  const methodOptions = useMemo(
    () => [
      {
        value: 'B1' as const,
        summary: 'Mét. B1 · ×1.00',
        label: 'Mét. B1 · ×1.00 — cañería embutida en pared (estándar)',
      },
      {
        value: 'E' as const,
        summary: 'Mét. E · ×1.29',
        label: 'Mét. E · ×1.29 — bandeja portacables abierta',
      },
      {
        value: 'E_open' as const,
        summary: 'Mét. E · ×1.40',
        label: 'Mét. E · ×1.40 — al aire libre / superficie',
      },
    ],
    [],
  );

  const hasInput =
    mode === 'power' ? parseNum(powerText) > 0 : parseNum(currentText) > 0;

  const result = useMemo(() => {
    if (!hasInput) return null;
    const powerFactor = parseNum(powerFactorText);
    if (powerFactor <= 0) return null;

    return calculateThermomagnetic({
      mode,
      powerW: mode === 'power' ? parseNum(powerText) : undefined,
      currentA: mode === 'current' ? parseNum(currentText) : undefined,
      circuitType,
      powerFactor,
      loadType,
      ambientTempC,
      installationMethod,
      circuitsInConduit,
      cableLengthM: Math.max(0, parseNum(lengthText)),
      distanceToMeterM: Math.max(0, parseNum(distanceText)),
    });
  }, [
    hasInput,
    mode,
    powerText,
    currentText,
    circuitType,
    powerFactorText,
    loadType,
    ambientTempC,
    installationMethod,
    circuitsInConduit,
    lengthText,
    distanceText,
  ]);

  return (
    <>
      <Stack.Screen options={calculatorHeaderOptions('Termomagnéticas')} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <FormCard>
            <ToggleGroup
              label="Modo de cálculo"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'power', label: 'Potencia (W)' },
                { value: 'current', label: 'Corriente (A)' },
              ]}
            />

            {mode === 'power' ? (
              <TextField
                label="Potencia (Watts)"
                value={powerText}
                onChangeText={setPowerText}
                placeholder="Ej: 2000"
              />
            ) : (
              <TextField
                label="Corriente (Amperios)"
                value={currentText}
                onChangeText={setCurrentText}
                placeholder="Ej: 16"
              />
            )}

            <ToggleGroup
              label="Tipo de circuito"
              value={circuitType}
              onChange={setCircuitType}
              options={[
                { value: 'single', label: 'Monofásico 220 V' },
                { value: 'three', label: 'Trifásico 380 V' },
              ]}
            />

            <TextField
              label="Factor de potencia"
              value={powerFactorText}
              onChangeText={setPowerFactorText}
              hint="1.0 resistivo · 0.85 A/A · 0.80 motores"
            />

            <SelectField
              label="Tipo de carga"
              value={loadType}
              onChange={setLoadType}
              options={LOAD_OPTIONS}
              hint="Determina la curva de disparo y el diferencial recomendado."
            />

            <SelectField
              label="Temperatura ambiente (°C)"
              value={ambientTempC}
              onChange={setAmbientTempC}
              options={temps.map((t) => ({
                value: t,
                summary: TEMP_LABELS[t]?.summary ?? `${t}°C`,
                label: TEMP_LABELS[t]?.label ?? `${t}°C`,
              }))}
              hint="Referencia IEC 60898: 30°C. Por encima, la térmica reduce su capacidad."
            />

            <SelectField
              label="Método de instalación del cable"
              value={installationMethod}
              onChange={setInstallationMethod}
              options={methodOptions}
              hint="Afecta la ampacidad del cable — IEC 60364-5-52 / AEA 90364"
            />

            <SelectField
              label="Circuitos en la misma cañería"
              value={circuitsInConduit}
              onChange={setCircuitsInConduit}
              options={CIRCUIT_COUNT_OPTIONS}
              hint="AEA 90364: máx. 3 circuitos generales por cañería; especiales en cañería propia."
            />

            <TextField
              label="Longitud del cable (m)"
              value={lengthText}
              onChangeText={setLengthText}
              placeholder="15"
              hint="Para verificar caída de tensión ΔU% ≤ 3%."
            />

            <TextField
              label="Distancia al medidor / cuadro principal (m)"
              value={distanceText}
              onChangeText={setDistanceText}
              placeholder="5"
              hint="Longitud desde el medidor hasta este tablero — estima Ik'' y el poder de corte necesario."
            />

            <TypicalLoads
              onSelect={(load) => {
                setMode('power');
                setPowerText(String(load.powerW));
                setPowerFactorText(String(load.powerFactor));
                setLoadType(load.loadType);
                setCircuitType(load.circuitType);
              }}
            />
          </FormCard>

          <ResultPanel result={result} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: space.md,
    gap: space.md,
    paddingBottom: space.xxl,
  },
});
