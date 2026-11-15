// The seven personal-data types compared in the co-occurrence matrix. The
// `key` must be a column that reports "Yes" / "No".
export type MatrixFieldKey =
  | 'individual_names_exposed'
  | 'addresses_exposed'
  | 'other_pii_leaked'
  | 'social_security_tax'
  | 'track1_credit_card'
  | 'track2_credit_card'
  | 'sub_fraud_use';

export interface MatrixField {
  key: MatrixFieldKey;
  label: string;
  short: string;
}

// One cell of the symmetric co-occurrence matrix. `count` is the number of
// rows where both the row and column fields were exposed ("Yes"); on the
// diagonal it is the single-field total.
export interface MatrixCell {
  row: number;
  col: number;
  rowKey: MatrixFieldKey;
  colKey: MatrixFieldKey;
  rowLabel: string;
  colLabel: string;
  count: number;
  rowTotal: number;
  colTotal: number;
  isDiagonal: boolean;
}

export interface MatrixData {
  matrix: MatrixCell[][];
  singleCounts: number[];
  maxCount: number;
}

// A hovered cell plus the container-local anchor point where the shell should
// place the cell tooltip.
export interface MatrixHover {
  cell: MatrixCell;
  x: number;
  y: number;
}
