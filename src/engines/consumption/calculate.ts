import type { CircuitType, EngineWarning } from '@/src/engines/types';

export type UsagePeriod = 'day' | 'week';

export interface ConsumptionInput {
  currentA: number;
  hours: number;
  period: UsagePeriod;
  circuitType: CircuitType;
  voltageV: number;
  powerFactor: number;
  /** Days in the billing month (default 30). */
  daysPerMonth?: number;
}

export interface ConsumptionResult {
  currentA: number;
  voltageV: number;
  powerFactor: number;
  powerW: number;
  hours: number;
  period: UsagePeriod;
  hoursPerDay: number;
  daysPerMonth: number;
  kwhPerDay: number;
  kwhPerWeek: number;
  kwhPerMonth: number;
  formula: string;
  warnings: EngineWarning[];
  error?: string;
}

function activePowerW(
  currentA: number,
  circuitType: CircuitType,
  voltageV: number,
  powerFactor: number,
): number {
  if (circuitType === 'three') {
    return Math.sqrt(3) * voltageV * currentA * powerFactor;
  }
  return voltageV * currentA * powerFactor;
}

export function calculateConsumption(
  input: ConsumptionInput,
): ConsumptionResult {
  const daysPerMonth = input.daysPerMonth ?? 30;
  const warnings: EngineWarning[] = [
    {
      code: 'ESTIMATE',
      severity: 'info',
      message:
        'Estimación con corriente constante. Si la carga varía, medí en distintos momentos o usá un medidor de energía.',
    },
  ];

  const empty = (error: string): ConsumptionResult => ({
    currentA: 0,
    voltageV: input.voltageV,
    powerFactor: input.powerFactor,
    powerW: 0,
    hours: input.hours,
    period: input.period,
    hoursPerDay: 0,
    daysPerMonth,
    kwhPerDay: 0,
    kwhPerWeek: 0,
    kwhPerMonth: 0,
    formula: '',
    warnings,
    error,
  });

  try {
    if (!Number.isFinite(input.currentA) || input.currentA <= 0) {
      throw new Error('Ingresá la corriente medida en amperios (> 0).');
    }
    if (!Number.isFinite(input.hours) || input.hours < 0) {
      throw new Error('Ingresá las horas de uso (≥ 0).');
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
    if (!Number.isFinite(daysPerMonth) || daysPerMonth <= 0) {
      throw new Error('Días del mes inválidos.');
    }

    const maxHours = input.period === 'day' ? 24 : 168;
    if (input.hours > maxHours) {
      throw new Error(
        input.period === 'day'
          ? 'Las horas por día no pueden superar 24.'
          : 'Las horas por semana no pueden superar 168.',
      );
    }

    const powerW = activePowerW(
      input.currentA,
      input.circuitType,
      input.voltageV,
      input.powerFactor,
    );
    const kw = powerW / 1000;

    const hoursPerDay =
      input.period === 'day' ? input.hours : input.hours / 7;
    const kwhPerDay = kw * hoursPerDay;
    const kwhPerWeek = kw * (input.period === 'week' ? input.hours : input.hours * 7);
    const kwhPerMonth = kwhPerDay * daysPerMonth;

    const formula =
      input.circuitType === 'three'
        ? 'E = √3 · V · I · cos φ · h / 1000'
        : 'E = V · I · cos φ · h / 1000';

    if (input.powerFactor < 1) {
      warnings.push({
        code: 'FP',
        severity: 'info',
        message:
          'Con cos φ < 1 la potencia activa (y el kWh) es menor que V×I aparente.',
      });
    }

    return {
      currentA: input.currentA,
      voltageV: input.voltageV,
      powerFactor: input.powerFactor,
      powerW,
      hours: input.hours,
      period: input.period,
      hoursPerDay,
      daysPerMonth,
      kwhPerDay,
      kwhPerWeek,
      kwhPerMonth,
      formula,
      warnings,
    };
  } catch (e) {
    return empty(e instanceof Error ? e.message : 'Error de cálculo');
  }
}

export function defaultVoltage(circuitType: CircuitType): number {
  return circuitType === 'three' ? 380 : 220;
}
