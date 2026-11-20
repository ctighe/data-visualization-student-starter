// One node of the icicle hierarchy. Only the deepest level (legal aftermath)
// carries a `value`; internal levels are aggregates of their descendants.
export interface IcicleDatum {
  name: string;
  value?: number;
  children?: IcicleDatum[];
}

// The three derived dimensions the hierarchy branches across, in display order.
export const ICICLE_DIMENSIONS = [
  'Exposed data type',
  'Response action',
  'Legal aftermath',
] as const;
