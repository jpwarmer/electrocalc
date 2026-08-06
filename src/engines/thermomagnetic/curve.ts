import type { EngineWarning, LoadType, TripCurve } from '@/src/engines/types';

export interface CurveSelection {
  curve: TripCurve;
  rangeLabel: string;
  loadLabel: string;
  warnings: EngineWarning[];
}

const LOAD_LABELS: Record<LoadType, string> = {
  resistive: 'Iluminación, calefacción',
  inductive: 'Aire acondicionado, cocina',
  motor: 'Motores, bombas, compresores',
  inverter: 'Inverter / EV / bomba de calor',
};

export function selectTripCurve(loadType: LoadType): CurveSelection {
  const warnings: EngineWarning[] = [];
  const loadLabel = LOAD_LABELS[loadType];

  switch (loadType) {
    case 'resistive':
      warnings.push({
        code: 'CURVE_B_MARKET',
        severity: 'info',
        message:
          'Curva B es técnicamente adecuada para cargas resistivas, pero en el mercado argentino la Curva C es el estándar comercial habitual.',
      });
      return { curve: 'B', rangeLabel: '3–5× In', loadLabel, warnings };
    case 'motor':
      warnings.push({
        code: 'AEA_90364_4_42',
        severity: 'critical',
        message:
          'Requiere relé térmico/guardamotor para sobrecarga según AEA 90364-4-42. La térmica Curva D solo cubre cortocircuito.',
      });
      return { curve: 'D', rangeLabel: '10–20× In', loadLabel, warnings };
    case 'inductive':
    case 'inverter':
    default:
      return { curve: 'C', rangeLabel: '5–10× In', loadLabel, warnings };
  }
}
