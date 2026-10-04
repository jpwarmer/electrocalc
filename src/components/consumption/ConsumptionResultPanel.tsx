import React from 'react';
import { Text, View } from 'react-native';
import type { ConsumptionResult } from '@/src/engines/consumption';
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
  result: ConsumptionResult | null;
  circuitLabel: string;
};

export function ConsumptionResultPanel({ result, circuitLabel }: Props) {
  if (!result) {
    return (
      <ResultEmpty message="Ingresá la corriente medida y las horas de uso." />
    );
  }

  if (result.error) {
    return <ResultEmpty message={result.error} error />;
  }

  const alerts = result.warnings.filter(
    (w) => w.severity === 'warning' || w.severity === 'critical',
  );
  const usageLabel =
    result.period === 'day'
      ? `${result.hours} h/día`
      : `${result.hours} h/semana`;

  return (
    <ResultReveal
      dep={`${result.kwhPerMonth}-${result.currentA}-${result.hours}-${result.period}`}
    >
      <ResultHead />

      <HeroCard
        label="Consumo mensual estimado"
        value={`${result.kwhPerMonth.toFixed(1)} kWh`}
        meta={`${usageLabel} · ${result.daysPerMonth} días`}
      >
        <Text style={resultText.coord}>
          {result.currentA.toFixed(2)} A · {result.voltageV} V · cos φ{' '}
          {result.powerFactor.toFixed(2)} · {circuitLabel}
        </Text>
        <Text style={resultText.legend}>{result.formula}</Text>
      </HeroCard>

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Por día"
          value={`${result.kwhPerDay.toFixed(2)}`}
          hint="kWh"
        />
        <StatCard
          label="Por semana"
          value={`${result.kwhPerWeek.toFixed(1)}`}
          hint="kWh"
        />
        <StatCard
          label="Potencia"
          value={
            result.powerW >= 1000
              ? `${(result.powerW / 1000).toFixed(2)} kW`
              : `${result.powerW.toFixed(0)} W`
          }
          hint="activa"
        />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>Cómo se calcula</Text>
        <Text style={resultText.detailBody}>
          Potencia activa ≈{' '}
          {result.powerW >= 1000
            ? `${(result.powerW / 1000).toFixed(2)} kW`
            : `${result.powerW.toFixed(0)} W`}{' '}
          con la corriente medida.
        </Text>
        <Text style={resultText.detailMuted}>
          Equivale a {result.hoursPerDay.toFixed(2)} h/día ×{' '}
          {result.daysPerMonth} días = {result.kwhPerMonth.toFixed(1)} kWh/mes.
        </Text>
      </DetailCard>

      <WarnCard
        items={alerts.map((w) => ({ key: w.code, message: w.message }))}
      />

      <InfoCard title="Tip de medición">
        <Text style={resultText.infoBody}>
          Si mediste con pinza amperométrica en un instante, el estimado asume
          ese valor constante durante las horas de uso. Para cargas variables,
          promediá varias mediciones.
        </Text>
      </InfoCard>

      <NormFooter
        lines={[
          'E (kWh) = P (kW) × horas. P = V × I × cos φ (mono) o √3 × V × I × cos φ (tri).',
          'Mes estándar: 30 días. Ajustá los días si tu factura usa otro período.',
        ]}
      />
    </ResultReveal>
  );
}
