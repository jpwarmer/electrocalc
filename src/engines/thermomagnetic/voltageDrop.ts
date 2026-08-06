import {
  COPPER_CONDUCTIVITY,
  MAX_VOLTAGE_DROP_PERCENT,
} from '@/src/engines/thermomagnetic/tables';
import { circuitVoltage } from '@/src/engines/thermomagnetic/current';
import type { CircuitType } from '@/src/engines/types';

export interface VoltageDropResult {
  dropV: number;
  dropPercent: number;
  ok: boolean;
}

/**
 * Voltage drop for Cu conductors.
 * Mono: ΔU = 2·L·Ib·cosφ / (γ·S)
 * Tri:  ΔU = √3·L·Ib·cosφ / (γ·S)
 */
export function calculateVoltageDrop(params: {
  lengthM: number;
  ib: number;
  powerFactor: number;
  sectionMm2: number;
  circuitType: CircuitType;
}): VoltageDropResult {
  const { lengthM, ib, powerFactor, sectionMm2, circuitType } = params;
  const L = Math.max(0, lengthM);
  const S = sectionMm2;
  const cosPhi = powerFactor;
  const voltage = circuitVoltage(circuitType);

  if (L === 0 || S <= 0) {
    return { dropV: 0, dropPercent: 0, ok: true };
  }

  const numerator =
    circuitType === 'three'
      ? Math.sqrt(3) * L * ib * cosPhi
      : 2 * L * ib * cosPhi;

  const dropV = numerator / (COPPER_CONDUCTIVITY * S);
  const dropPercent = (dropV / voltage) * 100;

  return {
    dropV,
    dropPercent,
    ok: dropPercent <= MAX_VOLTAGE_DROP_PERCENT,
  };
}
