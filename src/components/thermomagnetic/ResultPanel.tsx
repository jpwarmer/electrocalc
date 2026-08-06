import React from 'react';
import { Text, View } from 'react-native';
import type { ThermomagneticResult } from '@/src/engines/thermomagnetic';
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

type Props = {
  result: ThermomagneticResult | null;
};

export function ResultPanel({ result }: Props) {
  if (!result) {
    return (
      <ResultEmpty message="Completá los datos de entrada para ver la recomendación." />
    );
  }

  if (result.error && result.ib === 0) {
    return <ResultEmpty message={result.error} error />;
  }

  const alerts = result.warnings.filter(
    (w) => w.severity === 'warning' || w.severity === 'critical',
  );
  const check = result.coordinationOk ? '✓' : '✗';
  const methodLabel =
    result.installationMethod === 'E_open' ? 'E' : result.installationMethod;

  return (
    <ResultReveal dep={result}>
      <ResultHead />

      <HeroCard
        label="Interruptor Termomagnético Recomendado"
        value={`${result.in}A`}
        meta={`Curva ${result.curve}${result.loadLabel ? ` · ${result.loadLabel}` : ''}`}
      >
        <Text style={resultText.coord}>
          Ib ({result.ib.toFixed(2)} A) ≤ In ({result.in} A) ≤ Iz (
          {result.izCorrected.toFixed(1)} A) {check}
        </Text>
        <Text style={resultText.legend}>
          Ib = corriente carga · In = térmica · Iz = ampacidad cable
        </Text>
      </HeroCard>

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Corriente carga"
          value={`${result.ib.toFixed(2)} A`}
          hint="Ib"
        />
        <StatCard
          label="Curva"
          value={result.curve}
          hint={result.curveRangeLabel}
        />
        <StatCard
          label="Sección cable"
          value={`${result.sectionMm2} mm²`}
          hint="mínimo"
        />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>
          Sección de Cable Mínima — AEA 90364 / IEC 60364-5-52
        </Text>
        <Text style={[resultText.detailTitle, { fontSize: 28 }]}>
          {result.sectionMm2} mm²
        </Text>
        <Text style={resultText.detailBody}>
          Ampacidad base (Mét. {methodLabel}, {result.ambientTempC}°C):{' '}
          {result.izBase.toFixed(0)} A → corregida:{' '}
          {result.izCorrected.toFixed(1)} A (×{result.factors.fAgrup} agrup. ×
          {result.factors.fMetodo} inst.
          {result.factors.fTemp !== 1 ? ` ×${result.factors.fTemp} temp.` : ''})
        </Text>
        <Text style={resultText.detailBody}>
          Breaker máx. coordinado para este cable: {result.maxInForCable} A · Cu
          PVC · AEA 90364
        </Text>
        {!result.voltageDropOk ? (
          <Text style={resultText.errorText}>
            ΔU {result.voltageDropPercent.toFixed(2)}% supera el 3% — se aumentó
            sección.
          </Text>
        ) : (
          <Text style={resultText.detailMuted}>
            ΔU {result.voltageDropPercent.toFixed(2)}% (
            {result.voltageDropV.toFixed(2)} V)
          </Text>
        )}
      </DetailCard>

      <WarnCard
        items={alerts.map((w) => ({ key: w.code, message: w.message }))}
      />

      <InfoCard title="⚡ Poder de Corte Requerido (Icn)">
        <Text style={resultText.infoHero}>
          {result.icnRecommendedKa} kA
          {result.icnRecommendedKa > result.icnMinimumKa
            ? ` recomendado · mín. AEA ${result.icnMinimumKa} kA`
            : ' mínimo — AEA 90364-7-771'}
        </Text>
        <Text style={resultText.infoBody}>
          Ik'' estimado: ~{result.estimatedIkKa.toFixed(1)} kA · Exigir sello IRAM
        </Text>
        <Text style={resultText.infoBody}>
          Basado en {result.distanceToMeterM} m acometida · Z_red urbana típica
        </Text>
      </InfoCard>

      <HeroCard
        label="Diferencial (IDR) Sugerido"
        value={`${result.idrPoles}×${result.idrIn}A · 30mA`}
        meta="Obligatorio — AEA 90364-4-41 · 30mA"
        compact
      />

      <NormFooter
        lines={[
          'Normas: AEA 90364-4-41/43, 7-53, 7-771, IEC 60898-1, IEC 60364-5-52',
          'Coordinación: Ib ≤ In ≤ Iz (AEA 90364-4-43). Para motores: relé térmico aparte (AEA 90364-4-42).',
          '⚠ Diferencial 30mA obligatorio en circuitos terminales — AEA 90364-4-41',
        ]}
      />

      {result.error ? (
        <Text style={resultText.errorText}>{result.error}</Text>
      ) : null}
    </ResultReveal>
  );
}
