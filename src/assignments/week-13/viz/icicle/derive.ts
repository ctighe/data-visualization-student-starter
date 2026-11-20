import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';

// The dataset records most flags as "Yes" / "No" / "NA". Anything other than a
// trimmed, case-insensitive "Yes" counts as absent, so "NA" never registers.
const isYes = (value: string) => typeof value === 'string' && value.trim().toLowerCase() === 'yes';

// The three derived dimensions each collapse several raw columns into one
// mutually exclusive category per incident, so the hierarchy stays a tree
// (every incident has exactly one path through it).

// Exposed data type. Checked most- to least-specific: a breach that exposed
// both SSNs and card data is reported once, as the combined category.
export function getDataType(row: CyberattacksRow): string {
  const hasSSN = isYes(row.social_security_tax);
  const hasCard = isYes(row.track1_credit_card) || isYes(row.track2_credit_card);
  const hasPII =
    isYes(row.individual_names_exposed) ||
    isYes(row.addresses_exposed) ||
    isYes(row.other_pii_leaked);

  if (hasSSN && hasCard) return 'SSN & Financial Info';
  if (hasSSN) return 'Social Security / Tax ID';
  if (hasCard) return 'Payment Card / Financial';
  if (hasPII) return 'Personal Info (Names/PII)';
  return 'System / Other Confidential';
}

// Response action taken after the breach was discovered.
export function getResponseAction(row: CyberattacksRow): string {
  const paidRansom = isYes(row.bribe_ransom_paid);
  const monitoring = isYes(row.free_id_theft_monitoring);
  const disclosure = isYes(row.add_disclosure_info);

  if (paidRansom && monitoring) return 'Ransom Paid & ID Monitoring';
  if (paidRansom) return 'Ransom / Bribe Paid';
  if (monitoring && disclosure) return 'ID Monitoring & Public Disclosure';
  if (monitoring) return 'Free ID Monitoring Offered';
  if (disclosure) return 'Public Disclosure Only';
  return 'No Reported Proactive Action';
}

// Formal legal aftermath. Enforcement and litigation win over investigation:
// a case that ended in both litigation and a fine is reported as the combined
// outcome rather than twice.
export function getLegalAftermath(row: CyberattacksRow): string {
  const litigation = isYes(row.litigation_public);
  const penalty =
    isYes(row.penalties_actions_imposed) || isYes(row.fines_issued) || isYes(row.settlement_paid);
  const investigation = isYes(row.investigation) || isYes(row.undertook_investigation);

  if (litigation && penalty) return 'Litigation & Fines/Penalties';
  if (litigation) return 'Public Litigation Only';
  if (penalty) return 'Penalties / Settlements';
  if (investigation) return 'Investigation Undertaken';
  return 'No Formal Action / Resolved';
}
