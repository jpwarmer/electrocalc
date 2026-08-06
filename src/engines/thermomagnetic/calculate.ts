import type {
  CalculationMode,
  CircuitType,
  CorrectionFactors,
  EngineWarning,
  InstallationMethodId,
  LoadType,
  TripCurve,
} from '@/src/engines/types';
import { calculateIb, circuitVoltage } from '@/src/engines/thermomagnetic/current';
import {
  correctedIz,
  meetsCoordination,
  selectIn,
} from '@/src/engines/thermomagnetic/coordination';
import { calculateVoltageDrop } from '@/src/engines/thermomagnetic/voltageDrop';
import { recommendBreakingCapacity } from '@/src/engines/thermomagnetic/breakingCapacity';
import { selectTripCurve } from '@/src/engines/thermomagnetic/curve';
import {
  AEA_GENERAL_CIRCUIT_LIMIT,
  conductors,
  getGroupingFactor,
  getMethodFactor,
  getTemperatureFactor,
} from '@/src/engines/thermomagnetic/tables';

export interface ThermomagneticInput {
  mode: CalculationMode;
  powerW?: number;
  currentA?: number;
  circuitType: CircuitType;
  powerFactor: number;
  loadType: LoadType;
  ambientTempC: number;
  installationMethod: InstallationMethodId;
  circuitsInConduit: number;
  cableLengthM: number;
  distanceToMeterM: number;
}

export interface ThermomagneticResult {
  ib: number;
  in: number;
  curve: TripCurve;
  curveRangeLabel: string;
  loadLabel: string;
  loadType: LoadType;
  sectionMm2: number;
  maxInForCable: number;
  izBase: number;
  izCorrected: number;
  factors: CorrectionFactors;
  voltageDropV: number;
  voltageDropPercent: number;
  icnRecommendedKa: number;
  icnMinimumKa: number;
  estimatedIkKa: number;
  icnNote: string;
  distanceToMeterM: number;
  ambientTempC: number;
  installationMethod: InstallationMethodId;
  idrPoles: number;
  idrIn: number;
  coordinationOk: boolean;
  voltageDropOk: boolean;
  voltage: number;
  warnings: EngineWarning[];
  error?: string;
}

const IDR_RATINGS = [25, 40, 63, 80, 100];

function pickIdrIn(breakerIn: number): number {
  return IDR_RATINGS.find((r) => r >= breakerIn) ?? breakerIn;
}

function buildBaseWarnings(
  circuitsInConduit: number,
  ambientTempC: number,
): EngineWarning[] {
  const warnings: EngineWarning[] = [];

  if (circuitsInConduit > AEA_GENERAL_CIRCUIT_LIMIT) {
    warnings.push({
      code: 'AEA_90364_7_771',
      severity: 'warning',
      message:
        'No se permite instalar más de 3 circuitos generales en la misma cañería (AEA 90364-7-771).',
    });
  }

  if (ambientTempC >= 40) {
    warnings.push({
      code: 'TEMP_DERATING',
      severity: 'warning',
      message:
        'A ≥40°C la ampacidad del cable también se deratea (no solo la térmica). Verificá la sección con el factor de temperatura correspondiente.',
    });
  }

  return warnings;
}

function emptyExtras(input: ThermomagneticInput, curve: TripCurve) {
  return {
    curveRangeLabel: '5–10× In',
    loadLabel: '',
    loadType: input.loadType,
    maxInForCable: 0,
    icnMinimumKa: 6,
    estimatedIkKa: 0,
    distanceToMeterM: input.distanceToMeterM,
    ambientTempC: input.ambientTempC,
    installationMethod: input.installationMethod,
    idrPoles: input.circuitType === 'three' ? 4 : 2,
    idrIn: 0,
  };
}

/**
 * Full AEA 90364 / IEC 60898 thermomagnetic selection pipeline (offline).
 */
export function calculateThermomagnetic(
  input: ThermomagneticInput,
): ThermomagneticResult {
  const warnings = buildBaseWarnings(
    input.circuitsInConduit,
    input.ambientTempC,
  );
  const factors: CorrectionFactors = {
    fTemp: getTemperatureFactor(input.ambientTempC),
    fAgrup: getGroupingFactor(input.circuitsInConduit),
    fMetodo: getMethodFactor(input.installationMethod),
  };
  const voltage = circuitVoltage(input.circuitType);
  const idrPoles = input.circuitType === 'three' ? 4 : 2;

  try {
    const ib = calculateIb({
      mode: input.mode,
      powerW: input.powerW,
      currentA: input.currentA,
      circuitType: input.circuitType,
      powerFactor: input.powerFactor,
    });
    const inA = selectIn(ib);
    const curveSel = selectTripCurve(input.loadType);
    warnings.push(...curveSel.warnings);

    let chosen = null as null | {
      sectionMm2: number;
      maxInForCable: number;
      izBase: number;
      izCorrected: number;
      voltageDropV: number;
      voltageDropPercent: number;
      voltageDropOk: boolean;
      coordinationOk: boolean;
    };

    for (const conductor of conductors) {
      const { izBase, izCorrected } = correctedIz(
        conductor,
        input.circuitType,
        factors,
      );

      if (!meetsCoordination(ib, inA, izCorrected)) {
        continue;
      }

      const vd = calculateVoltageDrop({
        lengthM: input.cableLengthM,
        ib,
        powerFactor: input.powerFactor,
        sectionMm2: conductor.sectionMm2,
        circuitType: input.circuitType,
      });

      if (!vd.ok) {
        continue;
      }

      chosen = {
        sectionMm2: conductor.sectionMm2,
        maxInForCable: conductor.maxIn,
        izBase,
        izCorrected,
        voltageDropV: vd.dropV,
        voltageDropPercent: vd.dropPercent,
        voltageDropOk: true,
        coordinationOk: true,
      };
      break;
    }

    const icn = recommendBreakingCapacity(input.distanceToMeterM);
    const idrIn = pickIdrIn(inA);

    const baseFields = {
      curveRangeLabel: curveSel.rangeLabel,
      loadLabel: curveSel.loadLabel,
      loadType: input.loadType,
      icnMinimumKa: 6,
      estimatedIkKa: icn.estimatedIkKa,
      distanceToMeterM: input.distanceToMeterM,
      ambientTempC: input.ambientTempC,
      installationMethod: input.installationMethod,
      idrPoles,
      idrIn,
    };

    if (!chosen) {
      const last = conductors[conductors.length - 1];
      const { izBase, izCorrected } = correctedIz(
        last,
        input.circuitType,
        factors,
      );
      const vd = calculateVoltageDrop({
        lengthM: input.cableLengthM,
        ib,
        powerFactor: input.powerFactor,
        sectionMm2: last.sectionMm2,
        circuitType: input.circuitType,
      });

      return {
        ib,
        in: inA,
        curve: curveSel.curve,
        sectionMm2: last.sectionMm2,
        maxInForCable: last.maxIn,
        izBase,
        izCorrected,
        factors,
        voltageDropV: vd.dropV,
        voltageDropPercent: vd.dropPercent,
        icnRecommendedKa: icn.icnRecommendedKa,
        icnNote: icn.note,
        coordinationOk: meetsCoordination(ib, inA, izCorrected),
        voltageDropOk: vd.ok,
        voltage,
        warnings: [
          ...warnings,
          {
            code: 'NO_SOLUTION',
            severity: 'critical',
            message:
              'No hay sección en la matriz local (hasta 35 mm²) que cumpla Ib ≤ In ≤ Iz\' y ΔU% ≤ 3%.',
          },
        ],
        error: 'Sin solución dentro de la matriz de conductores.',
        ...baseFields,
      };
    }

    if (chosen.voltageDropPercent > 2.5) {
      warnings.push({
        code: 'VOLTAGE_DROP_MARGIN',
        severity: 'info',
        message: `Caída de tensión ${chosen.voltageDropPercent.toFixed(2)}% (límite 3%). Margen reducido.`,
      });
    }

    return {
      ib,
      in: inA,
      curve: curveSel.curve,
      sectionMm2: chosen.sectionMm2,
      maxInForCable: chosen.maxInForCable,
      izBase: chosen.izBase,
      izCorrected: chosen.izCorrected,
      factors,
      voltageDropV: chosen.voltageDropV,
      voltageDropPercent: chosen.voltageDropPercent,
      icnRecommendedKa: icn.icnRecommendedKa,
      icnNote: icn.note,
      coordinationOk: chosen.coordinationOk,
      voltageDropOk: chosen.voltageDropOk,
      voltage,
      warnings,
      ...baseFields,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error de cálculo';
    const icn = recommendBreakingCapacity(input.distanceToMeterM);
    return {
      ib: 0,
      in: 0,
      curve: 'C',
      sectionMm2: 0,
      izBase: 0,
      izCorrected: 0,
      factors,
      voltageDropV: 0,
      voltageDropPercent: 0,
      icnRecommendedKa: icn.icnRecommendedKa,
      icnNote: icn.note,
      coordinationOk: false,
      voltageDropOk: false,
      voltage,
      warnings,
      error: message,
      ...emptyExtras(input, 'C'),
      estimatedIkKa: icn.estimatedIkKa,
    };
  }
}
