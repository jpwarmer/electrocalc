import vdData from '@/src/data/voltage-drop.json';
import type {
  CircuitType,
  ConductorMaterial,
  EngineWarning,
} from '@/src/engines/types';

export const VOLTAGE_SINGLE = 220;
export const VOLTAGE_THREE = 380;

export interface VoltageDropInput {
  mode: 'power' | 'current';
  powerW?: number;
  currentA?: number;
  circuitType: CircuitType;
  material: ConductorMaterial;
  lengthM: number;
  sectionMm2: number;
  powerFactor: number;
  /** Limit to verify against (default 3%). */
  limitPercent?: number;
}

export interface VoltageDropCalcResult {
  ib: number;
  dropV: number;
  dropPercent: number;
  limitPercent: number;
  ok: boolean;
  voltage: number;
  resistivity: number;
  recommendedSectionMm2: number | null;
  warnings: EngineWarning[];
  error?: string;
}

function resistivity(material: ConductorMaterial): number {
  return material === 'copper' ? vdData.copper70C : vdData.aluminum70C;
}

function designCurrent(input: VoltageDropInput): number {
  if (input.mode === 'current') {
    const i = input.currentA ?? 0;
    if (!Number.isFinite(i) || i <= 0) throw new Error('Corriente inválida.');
    return i;
  }
  const p = input.powerW ?? 0;
  const fp = input.powerFactor;
  if (!Number.isFinite(p) || p <= 0) throw new Error('Potencia inválida.');
  if (!Number.isFinite(fp) || fp <= 0 || fp > 1) {
    throw new Error('Factor de potencia inválido.');
  }
  const v = input.circuitType === 'three' ? VOLTAGE_THREE : VOLTAGE_SINGLE;
  if (input.circuitType === 'three') {
    return p / (Math.sqrt(3) * v * fp);
  }
  return p / (v * fp);
}

/** ΔV = k · I · L · ρ / S  (k=2 mono, √3 tri). Uses ρ at 70°C. */
export function dropVolts(params: {
  circuitType: CircuitType;
  currentA: number;
  lengthM: number;
  sectionMm2: number;
  material: ConductorMaterial;
}): number {
  const rho = resistivity(params.material);
  const k = params.circuitType === 'three' ? Math.sqrt(3) : 2;
  return (k * params.currentA * params.lengthM * rho) / params.sectionMm2;
}

function findMinSection(params: {
  circuitType: CircuitType;
  currentA: number;
  lengthM: number;
  material: ConductorMaterial;
  voltage: number;
  limitPercent: number;
}): number | null {
  for (const s of vdData.sectionsMm2) {
    const dv = dropVolts({
      circuitType: params.circuitType,
      currentA: params.currentA,
      lengthM: params.lengthM,
      sectionMm2: s,
      material: params.material,
    });
    const pct = (dv / params.voltage) * 100;
    if (pct <= params.limitPercent) return s;
  }
  return null;
}

export function getVoltageDropSections() {
  return vdData.sectionsMm2;
}

export function calculateVoltageDropStandalone(
  input: VoltageDropInput,
): VoltageDropCalcResult {
  const warnings: EngineWarning[] = [
    {
      code: 'AEA_LIMIT',
      severity: 'info',
      message:
        'AEA 90364: máx. 3% en iluminación/tomacorrientes; 5% en fuerza motriz o total medidor→utilización.',
    },
  ];
  const voltage =
    input.circuitType === 'three' ? VOLTAGE_THREE : VOLTAGE_SINGLE;
  const limitPercent =
    input.limitPercent ?? vdData.limits.lightingOutletsPercent;
  const rho = resistivity(input.material);

  try {
    const ib = designCurrent(input);
    const dropV = dropVolts({
      circuitType: input.circuitType,
      currentA: ib,
      lengthM: Math.max(0, input.lengthM),
      sectionMm2: input.sectionMm2,
      material: input.material,
    });
    const dropPercent = (dropV / voltage) * 100;
    const ok = dropPercent <= limitPercent;

    let recommendedSectionMm2: number | null = input.sectionMm2;
    if (!ok) {
      recommendedSectionMm2 = findMinSection({
        circuitType: input.circuitType,
        currentA: ib,
        lengthM: input.lengthM,
        material: input.material,
        voltage,
        limitPercent,
      });
      warnings.push({
        code: 'SECTION_UPSIZE',
        severity: 'warning',
        message: recommendedSectionMm2
          ? `ΔU% supera ${limitPercent}%. Sección mínima sugerida: ${recommendedSectionMm2} mm².`
          : `ΔU% supera ${limitPercent}% y ninguna sección hasta 240 mm² alcanza el límite.`,
      });
    }

    if (input.material === 'aluminum') {
      warnings.push({
        code: 'ALUMINUM',
        severity: 'info',
        message:
          'El aluminio tiene ~60% más resistividad que el cobre: requiere mayor sección para la misma caída.',
      });
    }

    return {
      ib,
      dropV,
      dropPercent,
      limitPercent,
      ok,
      voltage,
      resistivity: rho,
      recommendedSectionMm2,
      warnings,
    };
  } catch (e) {
    return {
      ib: 0,
      dropV: 0,
      dropPercent: 0,
      limitPercent,
      ok: false,
      voltage,
      resistivity: rho,
      recommendedSectionMm2: null,
      warnings,
      error: e instanceof Error ? e.message : 'Error de cálculo',
    };
  }
}
