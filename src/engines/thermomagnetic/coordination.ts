import { breakerRatings } from '@/src/engines/thermomagnetic/tables';
import type { CorrectionFactors, ConductorRow, CircuitType } from '@/src/engines/types';
import { getBaseIz } from '@/src/engines/thermomagnetic/tables';

/** Next commercial breaker rating ≥ Ib. */
export function selectIn(ib: number): number {
  const rating = breakerRatings.find((r) => r >= ib);
  if (rating === undefined) {
    throw new Error(
      `Ib (${ib.toFixed(1)} A) supera el calibre máximo disponible (100 A).`,
    );
  }
  return rating;
}

export function correctedIz(
  conductor: ConductorRow,
  circuitType: CircuitType,
  factors: CorrectionFactors,
): { izBase: number; izCorrected: number } {
  const izBase = getBaseIz(conductor, circuitType);
  const izCorrected =
    izBase * factors.fTemp * factors.fAgrup * factors.fMetodo;
  return { izBase, izCorrected };
}

export function meetsCoordination(ib: number, inA: number, izCorrected: number): boolean {
  return ib <= inA && inA <= izCorrected;
}
