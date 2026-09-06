import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import type { ThermalMode, ThermalPowerResult } from '@/src/engines/thermal-power';
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
  result: ThermalPowerResult | null;
  mode: ThermalMode;
  circuitLabel: string;
};

function modeLabel(mode: ThermalMode): string {
  if (mode === 'frigorias') return 'Frigorías → corriente';
  if (mode === 'calorias') return 'Calorías → corriente';
  return 'HP → corriente';
}

export function ThermalPowerResultPanel({
  result,
  mode,
  circuitLabel,
}: Props) {
  const router = useRouter();

  if (!result) {
    return (
      <ResultEmpty message="Completá los datos para estimar la corriente." />
    );
  }

  if (result.error) {
    return <ResultEmpty message={result.error} error />;
  }

  const alerts = result.warnings.filter(
    (w) => w.severity === 'warning' || w.severity === 'critical',
  );

  return (
    <ResultReveal dep={`${mode}-${result.electricalW}-${result.currentA}`}>
      <ResultHead />

      <HeroCard
        label={modeLabel(mode)}
        value={`${result.currentA.toFixed(2)} A`}
        meta={`${circuitLabel} · ${result.formula}`}
      >
        <Text style={resultText.coord}>
          P eléctrica {result.electricalW.toFixed(0)} W · V {result.voltageV} V
          · cos φ {result.powerFactor.toFixed(2)}
        </Text>
        <Text style={resultText.legend}>
          Intensidad estimada para dimensionar ITM y cable
        </Text>
      </HeroCard>

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Corriente"
          value={`${result.currentA.toFixed(2)} A`}
          hint="Ib"
        />
        <StatCard
          label="Potencia eléc."
          value={`${result.electricalW.toFixed(0)} W`}
          hint="P"
        />
        <StatCard
          label={mode === 'hp' ? 'Mecánica' : 'Térmica'}
          value={
            mode === 'hp'
              ? `${result.mechanicalW.toFixed(0)} W`
              : `${result.thermalW.toFixed(0)} W`
          }
          hint={mode === 'hp' ? 'HP×746' : 'kcal/h×1.163'}
        />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>{result.formula}</Text>
        {mode === 'hp' ? (
          <Text style={resultText.detailBody}>
            Rendimiento η = {result.efficiency.toFixed(2)} · 1 HP = 746 W
          </Text>
        ) : (
          <Text style={resultText.detailBody}>
            COP = {result.cop.toFixed(2)} · 1 kcal/h = 1.163 W térmicos
          </Text>
        )}
        <Text style={resultText.detailMuted}>
          {circuitLabel} · FP {result.powerFactor.toFixed(2)}
        </Text>
      </DetailCard>

      <WarnCard
        items={alerts.map((w) => ({ key: w.code, message: w.message }))}
      />

      <InfoCard title="Siguiente paso">
        <Text style={resultText.infoBody}>
          Con ~{result.currentA.toFixed(1)} A podés elegir ITM y sección de
          cable.
        </Text>
        <Pressable onPress={() => router.push('/')}>
          <Text style={resultText.infoLink}>
            Abrir calculadora de termomagnéticas →
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/calculators/cable-section')}>
          <Text style={[resultText.infoLink, { marginTop: 6 }]}>
            Abrir calculadora de sección de cable →
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/calculators/quick-ref' as Href)}
        >
          <Text style={[resultText.infoLink, { marginTop: 6 }]}>
            Ver tabla rápida cable–ITM →
          </Text>
        </Pressable>
      </InfoCard>

      <NormFooter
        lines={[
          'Frigorías/calorías: capacidad térmica. El consumo eléctrico depende del COP/EER del equipo.',
          'HP: potencia mecánica. El consumo eléctrico depende del rendimiento del motor.',
          'Resultados orientativos — preferí siempre los datos de placa.',
        ]}
      />
    </ResultReveal>
  );
}
