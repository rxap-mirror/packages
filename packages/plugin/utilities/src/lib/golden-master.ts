import { Tree } from '@nx/devkit';

/**
 * Default path fragments/patterns excluded from golden-master snapshots.
 *
 * These are either noise (lock files, caches) or non-deterministic across
 * environments, so including them would make snapshots churn for reasons
 * unrelated to a generator's actual output.
 */
export const DEFAULT_GOLDEN_MASTER_EXCLUDES: RegExp[] = [
  /(^|\/)node_modules\//,
  /(^|\/)\.nx\//,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)pnpm-lock\.yaml$/,
];

export interface GoldenMasterOptions {
  /**
   * Additional path fragments (string `includes` match) or patterns (RegExp)
   * to exclude on top of {@link DEFAULT_GOLDEN_MASTER_EXCLUDES}.
   */
  exclude?: (string | RegExp)[];
  /**
   * When `true`, deleted files are recorded with a `<<DELETED>>` marker so the
   * snapshot also captures removals. Defaults to `false`.
   */
  includeDeletions?: boolean;
}

function isExcluded(path: string, excludes: (string | RegExp)[]): boolean {
  return excludes.some(e => (typeof e === 'string' ? path.includes(e) : e.test(path)));
}

/**
 * Returns the sorted list of file paths a generator created or modified in an
 * `@nx/devkit` {@link Tree}, with noisy/non-deterministic paths filtered out.
 *
 * Use this for a "did the generator touch the expected set of files" snapshot.
 * For content verification prefer {@link SnapshotGeneratedTree}.
 */
export function ListGeneratedFiles(tree: Tree, options: GoldenMasterOptions = {}): string[] {
  const excludes = [ ...DEFAULT_GOLDEN_MASTER_EXCLUDES, ...(options.exclude ?? []) ];
  return tree
    .listChanges()
    .filter(change => (options.includeDeletions ? true : change.type !== 'DELETE'))
    .map(change => change.path)
    .filter(path => !isExcluded(path, excludes))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Builds a golden-master snapshot of everything a generator changed in an
 * `@nx/devkit` {@link Tree}: a `{ path: content }` map covering every created
 * and modified file (content read from the recorded change, not re-read from
 * the tree), sorted by path for stable diffs.
 *
 * Pair with Jest's `toMatchSnapshot` so any migration that alters generated
 * output produces a reviewable diff:
 *
 * ```ts
 * await myGenerator(tree, options);
 * expect(SnapshotGeneratedTree(tree)).toMatchSnapshot('generated');
 * ```
 */
export function SnapshotGeneratedTree(
  tree: Tree,
  options: GoldenMasterOptions = {},
): Record<string, string> {
  const excludes = [ ...DEFAULT_GOLDEN_MASTER_EXCLUDES, ...(options.exclude ?? []) ];
  const result: Record<string, string> = {};
  const changes = tree
    .listChanges()
    .filter(change => !isExcluded(change.path, excludes))
    .sort((a, b) => a.path.localeCompare(b.path));
  for (const change of changes) {
    if (change.type === 'DELETE') {
      if (options.includeDeletions) {
        result[change.path] = '<<DELETED>>';
      }
      continue;
    }
    result[change.path] = change.content?.toString('utf-8') ?? '';
  }
  return result;
}
