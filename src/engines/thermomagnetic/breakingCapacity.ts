import {
  ICN_FAR_KA,
  ICN_NEAR_KA,
  ICN_NEAR_THRESHOLD_M,
  VOLTAGE_SINGLE,
} from '@/src/engines/thermomagnetic/tables';

export interface BreakingCapacityResult {
  icnRecommendedKa: number;
  estimatedIkKa: number;
  note: string;
  distanceM: number;
}

/** Rough Ik'' estimate for urban LV feeder (orientativo). */
export function estimatePresumedShortCircuitKa(distanceToMeterM: number): number {
  const d = Math.max(0, distanceToMeterM);
  // Z≈0.08 Ω red + ~0.001 Ω/m acometida → ~2.6 kA a 5 m en 220 V
  const z = 0.08 + 0.001 * d;
  return VOLTAGE_SINGLE / z / 1000;
}

/** Presumed short-circuit / Icn recommendation from distance to meter. */
export function recommendBreakingCapacity(
  distanceToMeterM: number,
): BreakingCapacityResult {
  const d = Math.max(0, distanceToMeterM);
  const estimatedIkKa = estimatePresumedShortCircuitKa(d);

  if (d < ICN_NEAR_THRESHOLD_M) {
    return {
      icnRecommendedKa: ICN_NEAR_KA,
      estimatedIkKa,
      distanceM: d,
      note: `Cerca del medidor (<${ICN_NEAR_THRESHOLD_M} m): preferir Icn ≥ ${ICN_NEAR_KA} kA en tablero principal. Mínimo AEA residencial: ${ICN_FAR_KA} kA.`,
    };
  }

  return {
    icnRecommendedKa: ICN_FAR_KA,
    estimatedIkKa,
    distanceM: d,
    note: `Icn = ${ICN_FAR_KA} kA mínimo (AEA 90364-7-771).`,
  };
}
