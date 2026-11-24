/**
 * Dist transforms applied to the built packages in dist/ before they are published (the former `prepack`).
 *
 * Shared by the release (`tools/scripts/release.mjs`, step 8) and the package-manager e2e matrix
 * (`tools/scripts/e2e-package-managers.mjs`), so the e2e run publishes exactly what a release would publish.
 *
 *   1. theme export          add `exports["./theme"]` to every Angular package that ships a theme.css
 *   2. strip workspace dep   remove the `workspace` marker dependency from every dist package.json
 *   3. strip ng-prism        run the `prism-strip` target of the given projects (removes the @Showcase decorators,
 *                            which import the dev-only @ng-prism/core); the build must already have run
 *   4. ng-prism guard        fail if anything in the dist of the given projects still references @ng-prism
 *
 * Every step throws (via `run`) on failure — the caller decides whether that aborts.
 */
import { execSync } from 'node:child_process';

/** default runner: echo the command, inherit stdio, throw on a non-zero exit */
function defaultRun(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

/**
 * @param {object} options
 * @param {string[]} options.projects  Nx project names whose dist is transformed (prism-strip + guard)
 * @param {(cmd: string) => unknown} [options.run]  command runner; must throw on failure
 */
export function applyDistTransforms({ projects, run = defaultRun }) {
  run('bash tools/scripts/add-theme-entry-point-to-package-json.sh');
  run('bash tools/scripts/remove-blacklisted-package-dependenceis.sh');
  // the @Showcase decorators import @ng-prism/core, which is not a dependency of the published packages.
  // Only projects with a prism-strip target (@rxap/plugin-ng-prism:init-library) run it; the build already ran.
  run(`yarn nx run-many --targets=prism-strip --projects=${projects.join(',')} --excludeTaskDependencies --skip-nx-cache --nxBail`);
  // safety net: nothing that references @ng-prism may be published (a library without a prism-strip target,
  // a stale dist, a new file type). Fails before the publish step.
  run(`node tools/scripts/check-dist-for-ng-prism.mjs --projects=${projects.join(',')}`);
}
