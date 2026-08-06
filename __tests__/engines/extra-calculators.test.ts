import {
  calculateCableSection,
  selectBreaker,
} from '@/src/engines/cable-section';
import { calculateVoltageDropStandalone } from '@/src/engines/voltage-drop';
import { calculatePower } from '@/src/engines/power';

describe('cable section engine', () => {
  it('selects section for tomacorrientes 3520W', () => {
    const r = calculateCableSection({
      mode: 'power',
      powerW: 3520,
      circuitType: 'single',
      powerFactor: 1,
      insulation: 'pvc',
      circuitKind: 'outlets',
      ambientTempC: 30,
      installationMethod: 'B1',
      circuitsInConduit: 1,
    });
    expect(r.error).toBeUndefined();
    expect(r.ib).toBeCloseTo(16, 1);
    expect(r.in).toBe(16);
    expect(r.sectionMm2).toBeGreaterThanOrEqual(2.5);
    expect(r.coordinationOk).toBe(true);
  });

  it('respects ducha mínima 4 mm²', () => {
    const r = calculateCableSection({
      mode: 'power',
      powerW: 2200,
      circuitType: 'single',
      powerFactor: 1,
      insulation: 'pvc',
      circuitKind: 'shower',
      ambientTempC: 30,
      installationMethod: 'B1',
      circuitsInConduit: 1,
    });
    expect(r.sectionMm2).toBeGreaterThanOrEqual(4);
  });

  it('XLPE can allow smaller section than PVC for same Ib', () => {
    const base = {
      mode: 'current' as const,
      currentA: 22,
      circuitType: 'single' as const,
      powerFactor: 1,
      circuitKind: 'other' as const,
      ambientTempC: 30,
      installationMethod: 'B1' as const,
      circuitsInConduit: 1,
    };
    const pvc = calculateCableSection({ ...base, insulation: 'pvc' });
    const xlpe = calculateCableSection({ ...base, insulation: 'xlpe' });
    expect(xlpe.sectionMm2).toBeLessThanOrEqual(pvc.sectionMm2);
  });

  it('selectBreaker picks next rating', () => {
    expect(selectBreaker(18)).toBe(20);
  });
});

describe('voltage drop engine', () => {
  it('flags excessive drop on long thin cable', () => {
    const r = calculateVoltageDropStandalone({
      mode: 'current',
      currentA: 10,
      circuitType: 'single',
      material: 'copper',
      lengthM: 80,
      sectionMm2: 1.5,
      powerFactor: 1,
      limitPercent: 3,
    });
    expect(r.ok).toBe(false);
    expect(r.recommendedSectionMm2).not.toBeNull();
    expect(r.recommendedSectionMm2!).toBeGreaterThan(1.5);
  });

  it('passes short run within 3%', () => {
    const r = calculateVoltageDropStandalone({
      mode: 'power',
      powerW: 500,
      circuitType: 'single',
      material: 'copper',
      lengthM: 15,
      sectionMm2: 2.5,
      powerFactor: 1,
      limitPercent: 3,
    });
    expect(r.ok).toBe(true);
  });
});

describe('power engine', () => {
  it('computes current for 2200W @ 220V mono FP1', () => {
    const r = calculatePower({
      circuitKind: 'ac_single',
      solveFor: 'current',
      powerW: 2200,
      voltageV: 220,
      powerFactor: 1,
    });
    expect(r.currentA).toBeCloseTo(10, 4);
  });

  it('computes three-phase power', () => {
    const r = calculatePower({
      circuitKind: 'ac_three',
      solveFor: 'power',
      voltageV: 380,
      currentA: 10,
      powerFactor: 0.85,
    });
    expect(r.powerW).toBeCloseTo(Math.sqrt(3) * 380 * 10 * 0.85, 2);
  });
});
