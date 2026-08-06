import {
  VOLTAGE_SINGLE,
  VOLTAGE_THREE,
} from '@/src/engines/thermomagnetic/tables';
import type { CircuitType } from '@/src/engines/types';

/** Design current Ib from power (W) or direct amperage. */
export function calculateIb(params: {
  mode: 'power' | 'current';
  powerW?: number;
  currentA?: number;
  circuitType: CircuitType;
  powerFactor: number;
}): number {
  if (params.mode === 'current') {
    const i = params.currentA ?? 0;
    if (!Number.isFinite(i) || i <= 0) {
      throw new Error('La corriente debe ser un valor positivo.');
    }
    return i;
  }

  const p = params.powerW ?? 0;
  const fp = params.powerFactor;
  if (!Number.isFinite(p) || p <= 0) {
    throw new Error('La potencia debe ser un valor positivo.');
  }
  if (!Number.isFinite(fp) || fp <= 0 || fp > 1) {
    throw new Error('El factor de potencia debe estar entre 0 y 1.');
  }

  if (params.circuitType === 'three') {
    return p / (Math.sqrt(3) * VOLTAGE_THREE * fp);
  }
  return p / (VOLTAGE_SINGLE * fp);
}

export function circuitVoltage(circuitType: CircuitType): number {
  return circuitType === 'three' ? VOLTAGE_THREE : VOLTAGE_SINGLE;
}
