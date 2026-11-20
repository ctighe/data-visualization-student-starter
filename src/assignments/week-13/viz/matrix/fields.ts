import type { MatrixField } from './types';

// The personal-data types shown on both axes of the co-occurrence matrix, in
// display order. `short` is used for the rotated column headers (space is tight
// in the dual-pane layout); `label` is used for the row headers and tooltips.
export const DATA_FIELDS: MatrixField[] = [
  { key: 'individual_names_exposed', label: 'Names Exposed', short: 'Names' },
  { key: 'addresses_exposed', label: 'Addresses Exposed', short: 'Addresses' },
  { key: 'other_pii_leaked', label: 'Other PII Leaked', short: 'Other PII' },
  { key: 'social_security_tax', label: 'SSN / Tax ID', short: 'SSN/Tax' },
  { key: 'track1_credit_card', label: 'Track 1 Credit Card', short: 'Track 1 CC' },
  { key: 'track2_credit_card', label: 'Track 2 Credit Card', short: 'Track 2 CC' },
  { key: 'sub_fraud_use', label: 'Subsequent Fraud Use', short: 'Sub. Fraud' },
];
