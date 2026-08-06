import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CableSectionResult } from '@/src/engines/cable-section';
import type { InsulationType } from '@/src/engines/types';
import {
  DetailCard,
  HeroCard,
  InfoCard,
  ResultEmpty,
  ResultHead,
  ResultReveal,
  StatCard,
  WarnCard,
  resultLayout,
  resultText,
} from '@/src/components/result/shared';

const TYPICAL_USE: Record<number, string> = {
  1.5: 'Iluminación',
  2.5: 'Tomacorrientes 16A',
  4: 'Tomacorrientes 20A / A·A',
  6: 'Cocina / ducha eléctrica',
  10: 'Tablero secundario',
  16: 'Alimentación principal',
  25: 'Acometida',
  35: 'Acometida grande',
  50: 'Industrial / acometida',
  70: 'Industrial / acometida',
  95: 'Industrial',
  120: 'Industrial',
  150: 'Industrial / alta potencia',
  185: 'Industrial / alta potencia',
  240: 'Industrial / alta potencia',
};

type Props = {
  result: CableSectionResult | null;
  insulation: InsulationType;
};

export function CableResultPanel({ result, insulation }: Props) {
  const router = useRouter();

  if (!result) {
    return (
      <ResultEmpty message="Completá los datos para ver la sección recomendada." />
    );
  }

  if (result.error && result.ib === 0) {
    return <ResultEmpty message={result.error} error />;
  }

  const alerts = result.warnings.filter(
    (w) => w.severity === 'warning' || w.severity === 'critical',
  );
  const use =
    TYPICAL_USE[result.sectionMm2] ??
    (result.minSectionMm2
      ? `Mín. AEA ${result.minSectionMm2} mm²`
      : 'Según cálculo');
  const check = result.coordinationOk ? '✓' : '✗';
  const insulationLabel = insulation === 'pvc' ? 'PVC 70°C' : 'XLPE 90°C';
  const methodLabel = result.installationMethod;

  return (
    <ResultReveal dep={result}>
      <ResultHead />

      <HeroCard
        label="Sección recomendada"
        value={`${result.sectionMm2} mm²`}
        meta={`${insulationLabel} · Cu`}
      />

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Corriente carga"
          value={`${result.ib.toFixed(1)} A`}
          hint="Ib"
        />
        <StatCard
          label="Ampacidad real"
          value={`${result.izCorrected.toFixed(0)} A`}
          hint="Iz_ef"
        />
        <StatCard label="Disyuntor" value={`${result.in} A`} hint="In" />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>Uso típico: {use}</Text>
        <Text style={resultText.coord}>
          Ib ({result.ib.toFixed(1)} A) ≤ In ({result.in} A) ≤ Iz_ef (
          {result.izCorrected.toFixed(0)} A) {check}
        </Text>
        <Text style={resultText.legend}>
          Ib = corriente carga · In = disyuntor · Iz_ef = ampacidad real del
          cable
        </Text>
        <Text style={resultText.detailBody}>
          Ampacidad base: {result.izBase.toFixed(0)} A → corregida{' '}
          {result.izCorrected.toFixed(1)} A
        </Text>
        <Text style={resultText.detailMuted}>
          Mét. {methodLabel} · ×{result.factors.fMetodo.toFixed(2)} · fAgrup ×
          {result.factors.fAgrup.toFixed(2)} · fTemp ×
          {result.factors.fTemp.toFixed(2)} · {insulationLabel} · Cu ·{' '}
          {result.ambientTempC}°C · {result.circuitsInConduit} circuito
          {result.circuitsInConduit === 1 ? '' : 's'}
        </Text>
      </DetailCard>

      <WarnCard
        items={alerts.map((w) => ({ key: w.code, message: w.message }))}
      />

      <InfoCard title="Caída de tensión">
        <Text style={resultText.infoBody}>
          En circuitos &gt; 15 m verificá también ΔU% (máx. 3% según AEA 90364).
        </Text>
        <Pressable onPress={() => router.push('/calculators/voltage-drop')}>
          <Text style={resultText.infoLink}>
            Abrir calculadora de caída de tensión →
          </Text>
        </Pressable>
      </InfoCard>

      {result.error ? (
        <Text style={resultText.errorText}>{result.error}</Text>
      ) : null}
    </ResultReveal>
  );
}
