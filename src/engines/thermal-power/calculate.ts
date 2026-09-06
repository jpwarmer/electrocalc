import data from '@/src/data/thermal-power.json';
import type { CircuitType, EngineWarning } from '@/src/engines/types';

export type ThermalMode = 'frigorias' | 'calorias' | 'hp';

export interface ThermalPowerInput {
  mode: ThermalMode;
  value: number;
  /** COP for cooling/heating capacity → electrical. */
  cop: number;
  /** Motor efficiency η for HP mode (0–1). */
  efficiency: number;
  circuitType: CircuitType;
  voltageV: number;
  powerFactor: number;
}

export interface ThermalPowerResult {
  mode: ThermalMode;
  thermalW: number;
  mechanicalW: number;
  electricalW: number;
  currentA: number;
  voltageV: number;
  powerFactor: number;
  cop: number;
  efficiency: number;
  formula: string;
  warnings: EngineWarning[];
  error?: string;
}

const KCAL_TO_W = data.conversions.kcalPerHourToWatts;
const W_PER_HP = data.conversions.wattsPerHp;

function designCurrent(
  powerW: number,
  circuitType: CircuitType,
  voltageV: number,
  powerFactor: number,
): number {
  if (circuitType === 'three') {
    return powerW / (Math.sqrt(3) * voltageV * powerFactor);
  }
  return powerW / (voltageV * powerFactor);
}

export function calculateThermalPower(
  input: ThermalPowerInput,
): ThermalPowerResult {
  const warnings: EngineWarning[] = [
    {
      code: 'ORIENTATIVE',
      severity: 'info',
      message:
        'Valores orientativos. Verificá placa del equipo (consumo real, COP/EER y FP).',
    },
  ];

  const empty = (error: string): ThermalPowerResult => ({
    mode: input.mode,
    thermalW: 0,
    mechanicalW: 0,
    electricalW: 0,
    currentA: 0,
    voltageV: input.voltageV,
    powerFactor: input.powerFactor,
    cop: input.cop,
    efficiency: input.efficiency,
    formula: '',
    warnings,
    error,
  });

  try {
    if (!Number.isFinite(input.value) || input.value <= 0) {
      throw new Error('Ingresá un valor mayor a 0.');
    }
    if (!Number.isFinite(input.voltageV) || input.voltageV <= 0) {
      throw new Error('Voltaje inválido.');
    }
    if (
      !Number.isFinite(input.powerFactor) ||
      input.powerFactor <= 0 ||
      input.powerFactor > 1
    ) {
      throw new Error('Factor de potencia inválido (0–1).');
    }

    let thermalW = 0;
    let mechanicalW = 0;
    let electricalW = 0;
    let formula = '';
    let cop = input.cop;
    let efficiency = input.efficiency;

    if (input.mode === 'frigorias' || input.mode === 'calorias') {
      if (!Number.isFinite(cop) || cop <= 0) {
        throw new Error('COP inválido (debe ser > 0).');
      }
      thermalW = input.value * KCAL_TO_W;
      electricalW = thermalW / cop;
      formula =
        input.mode === 'frigorias'
          ? 'P = (fg × 1.163) / COP'
          : 'P = (kcal/h × 1.163) / COP';
      if (cop < 2) {
        warnings.push({
          code: 'LOW_COP',
          severity: 'warning',
          message:
            'COP bajo: el consumo eléctrico estimado es alto. Revisá la placa del equipo.',
        });
      }
    } else {
      if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 1) {
        throw new Error('Rendimiento inválido (0–1).');
      }
      mechanicalW = input.value * W_PER_HP;
      electricalW = mechanicalW / efficiency;
      thermalW = 0;
      formula = 'P = (HP × 746) / η';
      cop = 1;
    }

    const currentA = designCurrent(
      electricalW,
      input.circuitType,
      input.voltageV,
      input.powerFactor,
    );

    if (input.mode === 'frigorias') {
      warnings.push({
        code: 'FG_NOTE',
        severity: 'info',
        message:
          'Las frigorías miden capacidad de frío, no watts eléctricos. Por eso se divide por el COP.',
      });
    }

    return {
      mode: input.mode,
      thermalW,
      mechanicalW,
      electricalW,
      currentA,
      voltageV: input.voltageV,
      powerFactor: input.powerFactor,
      cop,
      efficiency,
      formula,
      warnings,
    };
  } catch (e) {
    return empty(e instanceof Error ? e.message : 'Error de cálculo');
  }
}

export function getThermalCoolingPresets() {
  return data.coolingPresets;
}

export function getThermalHpPresets() {
  return data.hpPresets;
}

export function getThermalDefaults() {
  return data.defaults;
}

export function defaultVoltageForCircuit(circuitType: CircuitType): number {
  return circuitType === 'three' ? 380 : 220;
}
