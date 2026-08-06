import {
  calculateThermomagnetic,
  calculateIb,
  selectIn,
  getGroupingFactor,
  recommendBreakingCapacity,
  calculateVoltageDrop,
} from '@/src/engines/thermomagnetic';
import type { ThermomagneticInput } from '@/src/engines/thermomagnetic';

const baseInput = (): ThermomagneticInput => ({
  mode: 'power',
  powerW: 3500,
  circuitType: 'single',
  powerFactor: 0.85,
  loadType: 'inductive',
  ambientTempC: 30,
  installationMethod: 'B1',
  circuitsInConduit: 1,
  cableLengthM: 10,
  distanceToMeterM: 20,
});

describe('calculateIb', () => {
  it('computes Ib for A/A 3500W @ 220V FP 0.85 ≈ 18.7 A', () => {
    const ib = calculateIb({
      mode: 'power',
      powerW: 3500,
      circuitType: 'single',
      powerFactor: 0.85,
    });
    expect(ib).toBeCloseTo(18.716, 2);
  });

  it('computes three-phase Ib', () => {
    const ib = calculateIb({
      mode: 'power',
      powerW: 7500,
      circuitType: 'three',
      powerFactor: 0.8,
    });
    expect(ib).toBeCloseTo(7500 / (Math.sqrt(3) * 380 * 0.8), 4);
  });
});

describe('selectIn', () => {
  it('picks next commercial rating', () => {
    expect(selectIn(18.7)).toBe(20);
    expect(selectIn(20)).toBe(20);
    expect(selectIn(6)).toBe(6);
  });
});

describe('grouping factor', () => {
  it('matches AEA 771.16.II', () => {
    expect(getGroupingFactor(1)).toBe(1);
    expect(getGroupingFactor(2)).toBe(0.8);
    expect(getGroupingFactor(3)).toBe(0.7);
    expect(getGroupingFactor(4)).toBe(0.65);
    expect(getGroupingFactor(6)).toBe(0.57);
    expect(getGroupingFactor(10)).toBe(0.57);
  });
});

describe('breaking capacity', () => {
  it('recommends 10 kA near meter and 6 kA farther', () => {
    expect(recommendBreakingCapacity(10).icnRecommendedKa).toBe(10);
    expect(recommendBreakingCapacity(15).icnRecommendedKa).toBe(6);
    expect(recommendBreakingCapacity(30).icnRecommendedKa).toBe(6);
  });
});

describe('voltage drop', () => {
  it('flags ΔU% > 3 for long runs', () => {
    const short = calculateVoltageDrop({
      lengthM: 10,
      ib: 18.7,
      powerFactor: 0.85,
      sectionMm2: 2.5,
      circuitType: 'single',
    });
    expect(short.ok).toBe(true);

    const long = calculateVoltageDrop({
      lengthM: 120,
      ib: 18.7,
      powerFactor: 0.85,
      sectionMm2: 2.5,
      circuitType: 'single',
    });
    expect(long.ok).toBe(false);
    expect(long.dropPercent).toBeGreaterThan(3);
  });
});

describe('calculateThermomagnetic', () => {
  it('A/A 3500W → In 20A Curva C, cable ≥ 2.5 mm²', () => {
    const result = calculateThermomagnetic(baseInput());
    expect(result.error).toBeUndefined();
    expect(result.ib).toBeCloseTo(18.716, 2);
    expect(result.in).toBe(20);
    expect(result.curve).toBe('C');
    expect(result.sectionMm2).toBeGreaterThanOrEqual(2.5);
    expect(result.coordinationOk).toBe(true);
    expect(result.voltageDropOk).toBe(true);
    expect(result.ib).toBeLessThanOrEqual(result.in);
    expect(result.in).toBeLessThanOrEqual(result.izCorrected);
  });

  it('warns when more than 3 general circuits share conduit', () => {
    const result = calculateThermomagnetic({
      ...baseInput(),
      circuitsInConduit: 4,
    });
    expect(result.factors.fAgrup).toBe(0.65);
    expect(
      result.warnings.some((w) => w.code === 'AEA_90364_7_771'),
    ).toBe(true);
  });

  it('upsizes cable when voltage drop fails on smaller section', () => {
    const result = calculateThermomagnetic({
      ...baseInput(),
      cableLengthM: 100,
    });
    expect(result.error).toBeUndefined();
    expect(result.sectionMm2).toBeGreaterThan(2.5);
    expect(result.voltageDropOk).toBe(true);
    expect(result.voltageDropPercent).toBeLessThanOrEqual(3);
  });

  it('forces larger section under heavy derating (coordination)', () => {
    const result = calculateThermomagnetic({
      ...baseInput(),
      powerW: 3500,
      ambientTempC: 50,
      circuitsInConduit: 5,
      installationMethod: 'B1',
      cableLengthM: 5,
    });
    // With f_temp=0.71 and f_agrup=0.60, 2.5 mm² Iz' = 21*0.71*0.6 = 8.946 < 20
    // so section must grow until In ≤ Iz'
    expect(result.sectionMm2).toBeGreaterThan(2.5);
    expect(result.in).toBeLessThanOrEqual(result.izCorrected);
  });

  it('assigns Curva D and AEA 4-42 warning for motors', () => {
    const result = calculateThermomagnetic({
      ...baseInput(),
      powerW: 750,
      powerFactor: 0.8,
      loadType: 'motor',
    });
    expect(result.curve).toBe('D');
    expect(result.warnings.some((w) => w.code === 'AEA_90364_4_42')).toBe(
      true,
    );
  });

  it('supports current mode', () => {
    const result = calculateThermomagnetic({
      ...baseInput(),
      mode: 'current',
      currentA: 18.7,
      powerW: undefined,
    });
    expect(result.ib).toBeCloseTo(18.7, 4);
    expect(result.in).toBe(20);
  });
});
