import { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { csvParse } from 'd3-dsv';
import { useDimensions } from '../week-01/useDimensions';

interface Summary {
  rows: number;
  columns: number;
}

interface CyberattacksRow {
  year: number;
  organisation: string;
  critical_industry: string;
  org_size: string;
  digital_intensity: string;
  sector: string;
  country: string;
  cyb_security_role: string;
  cyb_frameworks: string;
  education_awareness_policy: string;
  policy: string;
  prevention_detection_recovery: string;
  network_segregation: string;
  inapp_remote_access: string;
  abs_encryption: string;
  detector: string;
  restructuring_attack: string;
  bribe_ransom_paid: string;
  free_id_theft_monitoring: string;
  add_disclosure_info: string;
  num_users_affected: number;
  overall_nature: string;
  attack_type: string;
  attacker: string;
  attack_vector: string;
  impact_data: string;
  ci_triad: string;
  individual_names_exposed: string;
  addresses_exposed: string;
  other_pii_leaked: string;
  track1_credit_card: string;
  track2_credit_card: string;
  social_security_tax: string;
  sub_fraud_use: string;
  investigation: string;
  undertook_investigation: string;
  litigation_public: string;
  penalties_actions_imposed: string;
  imp_penalties_org: string;
  fines_issued: string;
  settlement_paid: string;
  effect_share_price: string;
  summary: string;
}

const DATA_URL = `${import.meta.env.BASE_URL}datasets/cyberattacks/cyberattacks.csv`;

const FONT_SIZE = 28;
const LINE_HEIGHT = FONT_SIZE * 1.2;

export function CyberattacksSummary() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();
  const [data, setData] = useState<CyberattacksRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(DATA_URL)
      .then((response) => response.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = csvParse(text);
        setData(
          parsed.map((row) => ({
            year: +row.year,
            organisation: row.organisation,
            critical_industry: row.critical_industry,
            org_size: row.org_size,
            digital_intensity: row.digital_intensity,
            sector: row.sector,
            country: row.country,
            cyb_security_role: row.cyb_security_role,
            cyb_frameworks: row.cyb_frameworks,
            education_awareness_policy: row.education_awareness_policy,
            policy: row.policy,
            prevention_detection_recovery: row.prevention_detection_recovery,
            network_segregation: row.network_segregation,
            inapp_remote_access: row.inapp_remote_access,
            abs_encryption: row.abs_encryption,
            detector: row.detector,
            restructuring_attack: row.restructuring_attack,
            bribe_ransom_paid: row.bribe_ransom_paid,
            free_id_theft_monitoring: row.free_id_theft_monitoring,
            add_disclosure_info: row.add_disclosure_info,
            num_users_affected: +row.num_users_affected,
            overall_nature: row.overall_nature,
            attack_type: row.attack_type,
            attacker: row.attacker,
            attack_vector: row.attack_vector,
            impact_data: row.impact_data,
            ci_triad: row.ci_triad,
            individual_names_exposed: row.individual_names_exposed,
            addresses_exposed: row.addresses_exposed,
            other_pii_leaked: row.other_pii_leaked,
            track1_credit_card: row.track1_credit_card,
            track2_credit_card: row.track2_credit_card,
            social_security_tax: row.social_security_tax,
            sub_fraud_use: row.sub_fraud_use,
            investigation: row.investigation,
            undertook_investigation: row.undertook_investigation,
            litigation_public: row.litigation_public,
            penalties_actions_imposed: row.penalties_actions_imposed,
            imp_penalties_org: row.imp_penalties_org,
            fines_issued: row.fines_issued,
            settlement_paid: row.settlement_paid,
            effect_share_price: row.effect_share_price,
            summary: row.summary
          })),
        );
      })
      .catch((error) => {
        console.error('Failed to load data', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo<Summary | null>(() => {
    if (!data) return null;
    console.log(JSON.stringify(data, null, 2));
    return {
      rows: data.length,
      columns: Object.keys(data[0]).length,
    };
  }, [data]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0 || dimensions.height === 0 || !summary) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    select(svg)
      .selectAll('text')
      .data([summary])
      .join('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', FONT_SIZE)
      .selectAll('tspan')
      .data((d) => [`Rows: ${d.rows}`, `Columns: ${d.columns}`])
      .join('tspan')
      .attr('x', centerX)
      .attr('dy', (_d, i) => (i === 0 ? 0 : LINE_HEIGHT))
      .text((d) => d);
  }, [dimensions, summary]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Summary of the Cyberattacks dataset"
      ></svg>
    </div>
  );
}
