import appliances from '@/src/data/power-appliances.json';
import type { PowerCircuitKind, PowerSolveFor } from '@/src/engines/types';

export interface PowerInput {
  circuitKind: PowerCircuitKind;
  solveFor: PowerSolveFor;
  powerW?: number;
  voltageV?: number;
  currentA?: number;
  powerFactor: number;
}

export interface PowerResult {
  powerW: number;
  voltageV: number;
  currentA: number;
  apparentVA: number;
  formula: string;
  error?: string;
}

function factor(kind: PowerCircuitKind, fp: number): number {
  if (kind === 'dc') return 1;
  if (kind === 'ac_three') return Math.sqrt(3) * fp;
  return fp;
}

export function calculatePower(input: PowerInput): PowerResult {
  const fp =
    input.circuitKind === 'dc' ? 1 : Math.min(1, Math.max(0.01, input.powerFactor));
  const k = factor(input.circuitKind, fp);

  const formula =
    input.circuitKind === 'dc'
      ? 'P = V × I'
      : input.circuitKind === 'ac_three'
        ? 'P = √3 × V × I × cos φ'
        : 'P = V × I × cos φ';

  try {
    let powerW = input.powerW ?? 0;
    let voltageV = input.voltageV ?? 0;
    let currentA = input.currentA ?? 0;

    if (input.solveFor === 'power') {
      if (voltageV <= 0 || currentA <= 0) {
        throw new Error('Ingresá voltaje y corriente válidos.');
      }
      powerW = voltageV * currentA * k;
    } else if (input.solveFor === 'voltage') {
      if (powerW <= 0 || currentA <= 0) {
        throw new Error('Ingresá potencia y corriente válidos.');
      }
      voltageV = powerW / (currentA * k);
    } else {
      if (powerW <= 0 || voltageV <= 0) {
        throw new Error('Ingresá potencia y voltaje válidos.');
      }
      currentA = powerW / (voltageV * k);
    }

    const apparentVA =
      input.circuitKind === 'ac_three'
        ? Math.sqrt(3) * voltageV * currentA
        : voltageV * currentA;

    return { powerW, voltageV, currentA, apparentVA, formula };
  } catch (e) {
    return {
      powerW: 0,
      voltageV: 0,
      currentA: 0,
      apparentVA: 0,
      formula,
      error: e instanceof Error ? e.message : 'Error de cálculo',
    };
  }
}

export function getPowerAppliances() {
  return appliances.appliances;
}

export function defaultVoltage(kind: PowerCircuitKind): number {
  if (kind === 'dc') return 12;
  if (kind === 'ac_three') return 380;
  return 220;
}
