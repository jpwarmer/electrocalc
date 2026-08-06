import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PowerResult } from '@/src/engines/power';
import type { PowerCircuitKind, PowerSolveFor } from '@/src/engines/types';
import {
  DetailCard,
  HeroCard,
  InfoCard,
  NormFooter,
  ResultEmpty,
  ResultHead,
  ResultReveal,
  StatCard,
  resultLayout,
  resultText,
} from '@/src/components/result/shared';

type Props = {
  result: PowerResult | null;
  solveFor: PowerSolveFor;
  circuitKind: PowerCircuitKind;
  circuitLabel: string;
  powerFactor: number;
};

function heroFor(result: PowerResult, solveFor: PowerSolveFor) {
  if (solveFor === 'power') {
    return {
      label: 'Potencia calculada',
      value: `${result.powerW.toFixed(1)} W`,
    };
  }
  if (solveFor === 'voltage') {
    return {
      label: 'Voltaje calculado',
      value: `${result.voltageV.toFixed(1)} V`,
    };
  }
  return {
    label: 'Corriente calculada',
    value: `${result.currentA.toFixed(2)} A`,
  };
}

function formulaLines(kind: PowerCircuitKind) {
  if (kind === 'dc') {
    return {
      active: 'P = V × I',
      hint: 'Corriente continua — sin factor de potencia',
    };
  }
  if (kind === 'ac_three') {
    return {
      active: 'P = √3 × V × I × cos φ',
      hint: '√3 ≈ 1.732 · potencia aparente S = √3 × V × I',
    };
  }
  return {
    active: 'P = V × I × cos φ',
    hint: 'Potencia aparente S = V × I',
  };
}

export function PowerResultPanel({
  result,
  solveFor,
  circuitKind,
  circuitLabel,
  powerFactor,
}: Props) {
  const router = useRouter();

  if (!result) {
    return (
      <ResultEmpty message="Completá los datos para ver el resultado." />
    );
  }

  if (result.error) {
    return <ResultEmpty message={result.error} error />;
  }

  const hero = heroFor(result, solveFor);
  const formula = formulaLines(circuitKind);
  const reactiveHint =
    circuitKind !== 'dc' && powerFactor < 1
      ? `Con cos φ = ${powerFactor.toFixed(2)}, la corriente es mayor que en carga resistiva pura.`
      : null;

  return (
    <ResultReveal
      dep={`${solveFor}-${result.powerW}-${result.currentA}-${result.voltageV}-${circuitKind}`}
    >
      <ResultHead />

      <HeroCard
        label={hero.label}
        value={hero.value}
        meta={`${circuitLabel} · ${result.formula}`}
      >
        <Text style={resultText.coord}>
          P {result.powerW.toFixed(1)} W · V {result.voltageV.toFixed(1)} V · I{' '}
          {result.currentA.toFixed(2)} A
          {circuitKind !== 'dc' ? ` · cos φ ${powerFactor.toFixed(2)}` : ''}
        </Text>
        <Text style={resultText.legend}>
          Ib ≈ {result.currentA.toFixed(2)} A para dimensionar protecciones
        </Text>
      </HeroCard>

      <View style={resultLayout.statsRow}>
        <StatCard
          label="Potencia"
          value={`${result.powerW.toFixed(1)} W`}
          hint="P"
        />
        <StatCard
          label="Voltaje"
          value={`${result.voltageV.toFixed(1)} V`}
          hint="V"
        />
        <StatCard
          label="Corriente"
          value={`${result.currentA.toFixed(2)} A`}
          hint="I"
        />
      </View>

      <DetailCard>
        <Text style={resultText.detailTitle}>{formula.active}</Text>
        <Text style={resultText.detailBody}>{formula.hint}</Text>
        <Text style={resultText.detailMuted}>
          Potencia aparente S = {result.apparentVA.toFixed(1)} VA
          {circuitKind !== 'dc'
            ? ` · FP ${powerFactor.toFixed(2)}`
            : ''}
        </Text>
        {reactiveHint ? (
          <Text style={resultText.detailMuted}>{reactiveHint}</Text>
        ) : null}
      </DetailCard>

      <InfoCard title="Fórmulas">
        <Text style={resultText.infoHero}>DC</Text>
        <Text style={resultText.infoBody}>P = V × I</Text>
        <Text style={[resultText.infoHero, styles.formulaGap]}>AC monofásico</Text>
        <Text style={resultText.infoBody}>P = V × I × cos φ</Text>
        <Text style={[resultText.infoHero, styles.formulaGap]}>AC trifásico</Text>
        <Text style={resultText.infoBody}>P = √3 × V × I × cos φ</Text>
      </InfoCard>

      <InfoCard title="Siguiente paso">
        <Text style={resultText.infoBody}>
          Con la corriente ({result.currentA.toFixed(2)} A) dimensioná la
          termomagnética y la sección de cable.
        </Text>
        <Pressable onPress={() => router.push('/')}>
          <Text style={resultText.infoLink}>
            Abrir calculadora de termomagnéticas →
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/calculators/cable-section')}>
          <Text style={[resultText.infoLink, styles.linkGap]}>
            Abrir calculadora de sección de cable →
          </Text>
        </Pressable>
      </InfoCard>

      <NormFooter
        lines={[
          'Tensiones de uso corriente en Argentina: 220 V mono / 380 V tri (AEA/IRAM normaliza 230/400 V ±5%).',
          'cos φ: 1.0 resistivo · 0.85–0.90 motores · aplica solo en AC.',
          'No confundir frigorías de un aire acondicionado con su consumo eléctrico real.',
        ]}
      />
    </ResultReveal>
  );
}

const styles = StyleSheet.create({
  formulaGap: {
    marginTop: 8,
  },
  linkGap: {
    marginTop: 6,
  },
});
