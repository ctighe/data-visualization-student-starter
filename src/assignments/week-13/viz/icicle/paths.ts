import type { CyberattacksRow } from '../../../week-02/CyberattacksSummary';
import { getDataType, getLegalAftermath, getResponseAction } from './derive';

// Segment names repeat across branches (there are only five distinct legal
// outcomes but 72 legal segments), so a segment's identity is its whole path,
// not its name. NUL cannot appear in a category name, which makes it a safe
// join separator.
const SEPARATOR = '\u0000';

// Tally key for the whole hierarchy (the root segment).
export const ROOT_KEY = '';

// The three derived categories for one incident, in hierarchy order. This must
// stay in lockstep with `buildIcicleHierarchy` or a segment's count and its
// highlighted count would disagree.
export function segmentPathOf(row: CyberattacksRow): [string, string, string] {
  return [getDataType(row), getResponseAction(row), getLegalAftermath(row)];
}

export function pathKeyOf(names: readonly string[]): string {
  return names.join(SEPARATOR);
}

// Every incident under a segment: a row belongs when its categories match the
// path as a prefix. Used to hand a clicked segment's rows to the shell.
export function rowsForPath(rows: CyberattacksRow[], path: readonly string[]): CyberattacksRow[] {
  if (path.length === 0) return rows;
  return rows.filter((row) => {
    const categories = segmentPathOf(row);
    for (let index = 0; index < path.length; index++) {
      if (categories[index] !== path[index]) return false;
    }
    return true;
  });
}

// Counts how many highlighted incidents sit under each segment. Each selected
// row increments its type, its type+action, and its full path, so every ancestor
// gets the total of its subtree without storing row lists in the tree. The root
// count is just the number of selected rows.
export function tallySelectedPaths(
  selectedRows: ReadonlySet<CyberattacksRow>,
): Map<string, number> {
  const tally = new Map<string, number>();
  const bump = (key: string) => tally.set(key, (tally.get(key) ?? 0) + 1);

  for (const row of selectedRows) {
    const categories = segmentPathOf(row);
    for (let depth = 1; depth <= categories.length; depth++) {
      bump(pathKeyOf(categories.slice(0, depth)));
    }
  }

  if (selectedRows.size > 0) tally.set(ROOT_KEY, selectedRows.size);
  return tally;
}
