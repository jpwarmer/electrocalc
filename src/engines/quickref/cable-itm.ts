import quickref from '@/src/data/cable-itm-quickref.json';
import ratings from '@/src/data/breaker-ratings-extended.json';

export interface CableItmRow {
  sectionMm2: number;
  izMono: number;
  izTri: number;
  itmMin: number;
  itmMax: number;
  typicalUse: string;
  /** Calibres comerciales IEC/IRAM dentro del rango típico. */
  itmRatings: number[];
}

export function getCableItmQuickRef(): {
  basis: string;
  rule: string;
  rows: CableItmRow[];
} {
  const all = ratings.ratingsA;
  const rows = quickref.rows.map((row) => {
    const itmRatings = all.filter(
      (r) => r >= row.itmMin && r <= row.itmMax,
    );
    return {
      ...row,
      itmRatings: itmRatings.length > 0 ? itmRatings : [row.itmMax],
    };
  });
  return {
    basis: quickref.basis,
    rule: quickref.rule,
    rows,
  };
}
