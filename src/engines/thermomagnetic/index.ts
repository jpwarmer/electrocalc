export { calculateThermomagnetic } from '@/src/engines/thermomagnetic/calculate';
export type {
  ThermomagneticInput,
  ThermomagneticResult,
} from '@/src/engines/thermomagnetic/calculate';
export { calculateIb, circuitVoltage } from '@/src/engines/thermomagnetic/current';
export { selectIn, correctedIz, meetsCoordination } from '@/src/engines/thermomagnetic/coordination';
export { calculateVoltageDrop } from '@/src/engines/thermomagnetic/voltageDrop';
export { recommendBreakingCapacity } from '@/src/engines/thermomagnetic/breakingCapacity';
export { selectTripCurve } from '@/src/engines/thermomagnetic/curve';
export {
  conductors,
  breakerRatings,
  getTemperatureFactor,
  getGroupingFactor,
  getMethodFactor,
  getInstallationMethods,
  getTemperatureOptions,
  getTypicalLoads,
  AEA_GENERAL_CIRCUIT_LIMIT,
} from '@/src/engines/thermomagnetic/tables';
