import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { VoltageDropCalcResult } from '@/src/engines/voltage-drop';
import type { CircuitType } from '@/src/engines/types';
import {
  DetailCard,
  HeroCard,
  InfoCard,
  NormFooter,
  ResultEmpty,
  ResultHead,
  ResultReveal,
  StatCard,
  WarnCard,
  resultLayout,
  resultText,
} from '@/src/components/result/shared';
import { colors, fonts, space } from '@/src/theme';

type Props = {
  result: VoltageDropCalcResult | null;
  sectionMm2: number;
  lengthM: number;
  materialLabel: string;
  circuitLabel: string;
  circuitType: CircuitType;
};

export function VoltageDropResultPanel({
  result,
  sectionMm2,
  lengthM,
  materialLabel,
  circuitLabel,
  circuitType,
}: Props) {
  const router = useRouter();

  if (!result) {
    return (
      <ResultEmpty message="Completá los datos del circuito para ver ΔU%." />
    );
  }

  if (result.error) {
    return <ResultEmpty message={result.error} error />;
  }

  const alerts = result.warnings.filter(
    (w) => w.severity === 'warning' || w.severity === 'critical',
  );
  const status = result.ok ? 'Dentro del límite ✓' : 'Supera el límite ✗';
  const formula =
    circuitType === 'three'
      ? 'ΔU = √3 · I · L · ρ / S'
      : 'ΔU = 2 · I · L · ρ / S';
  const formulaHint =
    circuitType === 'three'
      ? 'Factor √3 (1.732) para sistemas trifásicos'
      : 'Factor 2 por ida y vuelta de corriente';

  return (
    <ResultReveal dep={result}>
      <ResultHead />

      <HeroCard
        label="Caída de tensión"
        value={`${result.dropPercent.toFixed(2)}%`}
        meta={`${status} · límite ${result.limitPercent}%`}
      >
        <Text style={resultText.coord}>
          ΔU {result.dropV.toFixed(2)} V · Vn {result.voltage} V · S{' '}
          {sectionMm2} mm² · L {lengthM} m
        </Text>
        <Text style={resultText.legend}>
          ΔU% = (ΔU / Vn) × 100 · AEA 90364
        </Text>
      </HeroCard>

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Corriente"
          value={`${result.ib.toFixed(2)} A`}
          hint="Ib"
        />
        <StatCard
          label="Caída"
          value={`${result.dropV.toFixed(2)} V`}
          hint="ΔU"
        />
        <StatCard
          label="Sección"
          value={`${sectionMm2} mm²`}
          hint="S"
        />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>
          {circuitLabel} · {materialLabel}
        </Text>
        <Text style={resultText.detailBody}>{formula}</Text>
        <Text style={resultText.detailMuted}>{formulaHint}</Text>
        <Text style={resultText.detailBody}>
          ρ = {result.resistivity} Ω·mm²/m (70°C) · L = {lengthM} m · S ={' '}
          {sectionMm2} mm²
        </Text>
        {!result.ok && result.recommendedSectionMm2 ? (
          <View style={styles.suggestBox}>
            <Text style={styles.suggestLabel}>Sección mínima sugerida</Text>
            <Text style={styles.suggestValue}>
              {result.recommendedSectionMm2} mm²
            </Text>
            <Text style={resultText.detailMuted}>
              Para quedar ≤ {result.limitPercent}% con esta carga y longitud
            </Text>
          </View>
        ) : null}
      </DetailCard>

      <WarnCard
        items={alerts.map((w) => ({ key: w.code, message: w.message }))}
      />

      <InfoCard title="Fórmulas">
        <Text style={resultText.infoHero}>Monofásico</Text>
        <Text style={resultText.infoBody}>ΔU = 2 · I · L · ρ / S</Text>
        <Text style={[resultText.infoHero, styles.formulaGap]}>Trifásico</Text>
        <Text style={resultText.infoBody}>ΔU = √3 · I · L · ρ / S</Text>
      </InfoCard>

      <InfoCard title="Sección de cable">
        <Text style={resultText.infoBody}>
          Si ΔU% supera el límite, aumentá la sección o acortá el recorrido.
          También verificá ampacidad (Ib ≤ In ≤ Iz).
        </Text>
        <Pressable onPress={() => router.push('/calculators/cable-section')}>
          <Text style={resultText.infoLink}>
            Abrir calculadora de sección de cable →
          </Text>
        </Pressable>
      </InfoCard>

      <NormFooter
        lines={[
          'AEA 90364: ΔU% máx. 3% en iluminación/tomacorrientes; 5% en motores o caída total medidor→utilización.',
          'ρ a 70°C (operación PVC). Cobre 0.0225 · Aluminio 0.036 Ω·mm²/m.',
        ]}
      />
    </ResultReveal>
  );
}

const styles = StyleSheet.create({
  suggestBox: {
    marginTop: 6,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8D4A8',
    gap: 2,
  },
  suggestLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: '#8A5A12',
  },
  suggestValue: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.copper,
  },
  formulaGap: {
    marginTop: 8,
  },
});
