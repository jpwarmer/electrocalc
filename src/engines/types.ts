/** Shared types for calculation engines (extensible for future tools). */

export type CircuitType = 'single' | 'three';
export type LoadType = 'resistive' | 'inductive' | 'motor' | 'inverter';
export type InstallationMethodId = 'B1' | 'E' | 'E_open';
export type CableInstallationMethodId = 'A' | 'B1' | 'E' | 'D';
export type InsulationType = 'pvc' | 'xlpe';
export type ConductorMaterial = 'copper' | 'aluminum';
export type PowerCircuitKind = 'dc' | 'ac_single' | 'ac_three';
export type PowerSolveFor = 'power' | 'voltage' | 'current';
export type CircuitKindId =
  | 'outlets'
  | 'lighting'
  | 'ac'
  | 'shower'
  | 'oven'
  | 'ev'
  | 'special'
  | 'other';
export type CalculationMode = 'power' | 'current';
export type TripCurve = 'B' | 'C' | 'D';
export type WarningSeverity = 'info' | 'warning' | 'critical';

export interface EngineWarning {
  code: string;
  severity: WarningSeverity;
  message: string;
}

export interface CorrectionFactors {
  fTemp: number;
  fAgrup: number;
  fMetodo: number;
}

export interface ConductorRow {
  sectionMm2: number;
  izMono: number;
  izTri: number;
  maxIn: number;
}
