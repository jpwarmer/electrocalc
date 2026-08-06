import ampacity from '@/src/data/cable-ampacity.json';
import methods from '@/src/data/cable-installation-methods.json';
import tempFactors from '@/src/data/cable-temperature-factors.json';
import circuitMins from '@/src/data/circuit-min-sections.json';
import breakers from '@/src/data/breaker-ratings-extended.json';
import typical from '@/src/data/cable-typical-loads.json';
import groupingData from '@/src/data/grouping-factors.json';
import type {
  CableInstallationMethodId,
  CircuitKindId,
  CircuitType,
  CorrectionFactors,
  EngineWarning,
  InsulationType,
} from '@/src/engines/types';

export const VOLTAGE_SINGLE = 220;
export const VOLTAGE_THREE = 380;

export function calculateDesignCurrent(params: {
  mode: 'power' | 'current';
  powerW?: number;
  currentA?: number;
  circuitType: CircuitType;
  powerFactor: number;
}): number {
  if (params.mode === 'current') {
    const i = params.currentA ?? 0;
    if (!Number.isFinite(i) || i <= 0) throw new Error('Corriente inválida.');
    return i;
  }
  const p = params.powerW ?? 0;
  const fp = params.powerFactor;
  if (!Number.isFinite(p) || p <= 0) throw new Error('Potencia inválida.');
  if (!Number.isFinite(fp) || fp <= 0 || fp > 1) {
    throw new Error('Factor de potencia inválido.');
  }
  if (params.circuitType === 'three') {
    return p / (Math.sqrt(3) * VOLTAGE_THREE * fp);
  }
  return p / (VOLTAGE_SINGLE * fp);
}

function pickTempFactor(
  insulation: InsulationType,
  ambientC: number,
): number {
  const list = insulation === 'pvc' ? tempFactors.pvc : tempFactors.xlpe;
  const exact = list.find((f) => f.ambientC === ambientC);
  if (exact) return exact.factor;
  const sorted = [...list].sort((a, b) => a.ambientC - b.ambientC);
  if (ambientC <= sorted[0].ambientC) return sorted[0].factor;
  return sorted[sorted.length - 1].factor;
}

function groupingFactor(circuits: number): number {
  const n = Math.max(1, Math.floor(circuits));
  if (n >= 6) return groupingData.factors[groupingData.factors.length - 1].factor;
  return groupingData.factors.find((f) => f.circuits === n)?.factor ?? 1;
}

function methodFactor(id: CableInstallationMethodId): number {
  return methods.methods.find((m) => m.id === id)?.factor ?? 1;
}

export function selectBreaker(ib: number): number {
  const rating = breakers.ratingsA.find((r) => r >= ib);
  if (rating === undefined) {
    throw new Error(`Ib (${ib.toFixed(1)} A) supera calibres disponibles.`);
  }
  return rating;
}

export interface CableSectionInput {
  mode: 'power' | 'current';
  powerW?: number;
  currentA?: number;
  circuitType: CircuitType;
  powerFactor: number;
  insulation: InsulationType;
  circuitKind: CircuitKindId;
  ambientTempC: number;
  installationMethod: CableInstallationMethodId;
  circuitsInConduit: number;
}

export interface CableSectionResult {
  ib: number;
  in: number;
  sectionMm2: number;
  izBase: number;
  izCorrected: number;
  factors: CorrectionFactors;
  minSectionMm2: number;
  coordinationOk: boolean;
  voltage: number;
  ambientTempC: number;
  installationMethod: CableInstallationMethodId;
  circuitsInConduit: number;
  insulation: InsulationType;
  warnings: EngineWarning[];
  error?: string;
}

export function getCableMethods() {
  return methods.methods;
}

export function getCableTempOptions(insulation: InsulationType) {
  return (insulation === 'pvc' ? tempFactors.pvc : tempFactors.xlpe).map(
    (f) => f.ambientC,
  );
}

export function getCircuitKinds() {
  return circuitMins.types;
}

export function getCableTypicalLoads() {
  return typical.loads;
}

export function calculateCableSection(
  input: CableSectionInput,
): CableSectionResult {
  const warnings: EngineWarning[] = [];
  const kind = circuitMins.types.find((t) => t.id === input.circuitKind);
  const minSectionMm2 = kind?.minSectionMm2 ?? 0;
  const factors: CorrectionFactors = {
    fTemp: pickTempFactor(input.insulation, input.ambientTempC),
    fAgrup: groupingFactor(input.circuitsInConduit),
    fMetodo: methodFactor(input.installationMethod),
  };
  const voltage =
    input.circuitType === 'three' ? VOLTAGE_THREE : VOLTAGE_SINGLE;

  const meta = {
    ambientTempC: input.ambientTempC,
    installationMethod: input.installationMethod,
    circuitsInConduit: input.circuitsInConduit,
    insulation: input.insulation,
  };

  if (input.circuitsInConduit > groupingData.aeaGeneralCircuitLimit) {
    warnings.push({
      code: 'AEA_90364_7_771',
      severity: 'warning',
      message:
        'Norma AEA 90364-7-771: No se permite instalar más de 3 circuitos generales en la misma cañería.',
    });
  }

  if (kind?.exclusiveConduit) {
    warnings.push({
      code: 'EXCLUSIVE_CIRCUIT',
      severity: 'info',
      message:
        'Circuito especial: debe ir en cañería propia (AEA 90364-7-771).',
    });
  }

  if (input.circuitKind === 'ev') {
    warnings.push({
      code: 'AEA_90364_7_722',
      severity: 'critical',
      message:
        'Carga VE (AEA 90364-7-722): circuito exclusivo, sin simultaneidad. Diferencial Tipo B (o Tipo A con detección DC) 30 mA obligatorio.',
    });
  }

  warnings.push({
    code: 'IDR_30MA',
    severity: 'info',
    message:
      'IDR diferencial 30 mA obligatorio en circuitos de tomacorrientes (AEA 90364-7-770).',
  });

  try {
    const ib = calculateDesignCurrent(input);
    const inA = selectBreaker(ib);

    let chosen: {
      sectionMm2: number;
      izBase: number;
      izCorrected: number;
    } | null = null;

    for (const row of ampacity.sections) {
      if (row.sectionMm2 < minSectionMm2) continue;
      const izBase = input.insulation === 'pvc' ? row.izPvc : row.izXlpe;
      const izCorrected =
        izBase * factors.fTemp * factors.fAgrup * factors.fMetodo;
      if (ib <= inA && inA <= izCorrected) {
        chosen = {
          sectionMm2: row.sectionMm2,
          izBase,
          izCorrected,
        };
        break;
      }
    }

    if (!chosen) {
      const last = ampacity.sections[ampacity.sections.length - 1];
      const izBase = input.insulation === 'pvc' ? last.izPvc : last.izXlpe;
      const izCorrected =
        izBase * factors.fTemp * factors.fAgrup * factors.fMetodo;
      return {
        ib,
        in: inA,
        sectionMm2: last.sectionMm2,
        izBase,
        izCorrected,
        factors,
        minSectionMm2,
        coordinationOk: false,
        voltage,
        warnings: [
          ...warnings,
          {
            code: 'NO_SECTION',
            severity: 'critical',
            message:
              'Ninguna sección hasta 240 mm² cumple Ib ≤ In ≤ Iz′ con los factores aplicados.',
          },
        ],
        error: 'Sin sección válida en la matriz local.',
        ...meta,
      };
    }

    return {
      ib,
      in: inA,
      sectionMm2: chosen.sectionMm2,
      izBase: chosen.izBase,
      izCorrected: chosen.izCorrected,
      factors,
      minSectionMm2,
      coordinationOk: true,
      voltage,
      warnings,
      ...meta,
    };
  } catch (e) {
    return {
      ib: 0,
      in: 0,
      sectionMm2: 0,
      izBase: 0,
      izCorrected: 0,
      factors,
      minSectionMm2,
      coordinationOk: false,
      voltage,
      warnings,
      error: e instanceof Error ? e.message : 'Error de cálculo',
      ...meta,
    };
  }
}
