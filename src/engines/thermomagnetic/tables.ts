import conductorsData from '@/src/data/conductors-pvc70.json';
import groupingData from '@/src/data/grouping-factors.json';
import temperatureData from '@/src/data/temperature-factors.json';
import methodsData from '@/src/data/installation-methods.json';
import breakerData from '@/src/data/breaker-ratings.json';
import typicalLoadsData from '@/src/data/typical-loads.json';

import type { ConductorRow, InstallationMethodId } from '@/src/engines/types';

export const COPPER_CONDUCTIVITY = 56; // m/(Ω·mm²)
export const MAX_VOLTAGE_DROP_PERCENT = 3;
export const VOLTAGE_SINGLE = 220;
export const VOLTAGE_THREE = 380;
export const ICN_NEAR_THRESHOLD_M = 15;
export const ICN_NEAR_KA = 10;
export const ICN_FAR_KA = 6;
export const AEA_GENERAL_CIRCUIT_LIMIT = groupingData.aeaGeneralCircuitLimit;

export const conductors: ConductorRow[] = conductorsData.conductors;
export const breakerRatings: number[] = breakerData.ratingsA;

export function getTemperatureFactor(ambientC: number): number {
  const exact = temperatureData.factors.find((f) => f.ambientC === ambientC);
  if (exact) return exact.factor;

  const sorted = [...temperatureData.factors].sort((a, b) => a.ambientC - b.ambientC);
  if (ambientC <= sorted[0].ambientC) return sorted[0].factor;
  if (ambientC >= sorted[sorted.length - 1].ambientC) {
    return sorted[sorted.length - 1].factor;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (ambientC >= a.ambientC && ambientC <= b.ambientC) {
      const t = (ambientC - a.ambientC) / (b.ambientC - a.ambientC);
      return a.factor + t * (b.factor - a.factor);
    }
  }
  return 1;
}

export function getGroupingFactor(circuits: number): number {
  const n = Math.max(1, Math.floor(circuits));
  if (n >= 6) {
    return groupingData.factors[groupingData.factors.length - 1].factor;
  }
  const row = groupingData.factors.find((f) => f.circuits === n);
  return row?.factor ?? 1;
}

export function getMethodFactor(methodId: InstallationMethodId): number {
  const row = methodsData.methods.find((m) => m.id === methodId);
  return row?.factor ?? 1;
}

export function getInstallationMethods() {
  return methodsData.methods;
}

export function getTemperatureOptions() {
  return temperatureData.factors.map((f) => f.ambientC);
}

export function getTypicalLoads() {
  return typicalLoadsData.loads;
}

export function getBaseIz(conductor: ConductorRow, circuitType: 'single' | 'three'): number {
  return circuitType === 'single' ? conductor.izMono : conductor.izTri;
}
