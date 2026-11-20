import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { getDataType, getLegalAftermath, getResponseAction } from './derive';
import type { IcicleDatum } from './types';

// A response-action level: its node plus the legal-aftermath children keyed by
// name, so repeated paths attach to the same node.
interface ActionLevel {
  node: IcicleDatum;
  outcomes: Map<string, IcicleDatum>;
}

// An exposed-data-type level: its node plus the response actions beneath it.
interface TypeLevel {
  node: IcicleDatum;
  actions: Map<string, ActionLevel>;
}

// Builds the icicle hierarchy:
//   root -> Exposed data type -> Response action -> Legal aftermath
//
// Incidents are aggregated at each combination of the three dimensions rather
// than attached as individual leaves, so a leaf's `value` is the number of
// incidents that share that path. D3's `hierarchy().sum()` then rolls those
// counts up into every ancestor.
export function buildIcicleHierarchy(rows: CyberattacksRow[]): IcicleDatum {
  const root: IcicleDatum = { name: 'Cyberattacks', children: [] };
  // Maps keep insertion order, so sibling order follows the data and the
  // ordinal color assignment is stable across renders of the same dataset.
  const byType = new Map<string, TypeLevel>();

  for (const row of rows) {
    const typeName = getDataType(row);
    const actionName = getResponseAction(row);
    const legalName = getLegalAftermath(row);

    let typeLevel = byType.get(typeName);
    if (!typeLevel) {
      const node: IcicleDatum = { name: typeName, children: [] };
      typeLevel = { node, actions: new Map() };
      byType.set(typeName, typeLevel);
      root.children!.push(node);
    }

    let actionLevel = typeLevel.actions.get(actionName);
    if (!actionLevel) {
      const node: IcicleDatum = { name: actionName, children: [] };
      actionLevel = { node, outcomes: new Map() };
      typeLevel.actions.set(actionName, actionLevel);
      typeLevel.node.children!.push(node);
    }

    let leaf = actionLevel.outcomes.get(legalName);
    if (!leaf) {
      leaf = { name: legalName, value: 0 };
      actionLevel.outcomes.set(legalName, leaf);
      actionLevel.node.children!.push(leaf);
    }

    leaf.value = (leaf.value ?? 0) + 1;
  }

  return root;
}
