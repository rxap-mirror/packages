# Framework watch

Angular, Nx and NestJS are not updated by Renovate (`renovate.json5` disables them): each update needs `nx migrate`,
the package version stamping and the generator version constants. The framework watch starts these updates
automatically, through the same release cooldown as every other dependency (`UPGRADE-NOTES.md` section 4).

## How a framework update gets in

1. **Watch** (`framework-watch` job, daily schedule `FRAMEWORK_WATCH=true`, `tools/scripts/framework-watch.mjs`):
   for each group it looks for the newest version whose **whole group** passed the cooldown and creates the branch
   `migrate/<leader>/<version>` (scoped names with `_`: `migrate/@angular_core/22.3.2`).
2. **Migration** (`nx-migrate` job of rxap/gitlab-ci, push pipeline of that branch): `nx migrate <leader>@<version>`,
   the migrations (one commit each), `pnpm post-migrate`, then the merge request with the labels
   `migration::successful|failed`, `migrate::<leader>`, the migration log and `migrations.json`.
3. **post-migrate** (`tools/scripts/post-migrate.sh`): completes the group (`align-framework-group.mjs`), copies the
   root ranges into the packages, stamps the package majors (`<framework major>.0.0`) and the version constants of
   `@rxap/plugin-angular` / `@rxap/plugin-nestjs`, then `fix-dependencies` and `update-package-group`.
4. **Merge request pipeline:** the workspace pipeline plus `supply-chain:check`. If it is red, the fix agent
   (`AGENT-FIX.md`) tries to repair it, at most twice.
5. **You merge.** Framework updates are never merged automatically. After a **major** release run
   `pnpm release --stamped` (dry run first, `RELEASE_WORKFLOW.md`).

## Package groups

A framework update always moves its whole group (`tools/scripts/lib/framework-groups.mjs`):

| Group | Leader (branch name) | Lockstep: same version | Followers: own version line |
|---|---|---|---|
| nx | `nx` | `nx-migrations.packageGroup` of `nx` (`@nx/*`) | `@swc/*`, `@swc-node/*` (newest eligible within the peers) |
| angular | `@angular/core` | `ng-update.packageGroup` of `@angular/core` | `@angular/cli` + its group (`@angular-devkit/*`, `@angular/build`, ...), `@angular/material` + `@angular/cdk`, `@schematics/angular`, `ng-packagr` on the same major.minor; `@angular-eslint/*` on the same major |
| nestjs | `@nestjs/core` | `@nestjs/common`, `microservices`, `platform-*`, `testing`, `websockets` | other `@nestjs/*`, `class-validator`, `class-transformer`, `helmet`, `express`, ... (newest eligible within the peers) |

- Only root dependencies count; versions are written exact.
- A version is **eligible** only when every changed member passed its cooldown tier (7 / 14 / 30 days by weekly
  downloads). Otherwise the whole group stays pending; nothing is updated partially. Installed versions are accepted
  as they are (they went through the cooldown or a dated exception already).
- **Peer gate:** a version that creates a new peer conflict with an installed package outside the group waits, e.g.
  Angular 23 while `@nx/angular` accepts `< 23`: the angular group then stays on the newest 22.x until an Nx
  migration widens the range. Conflicts that already exist do not block (`@nx/nest` and NestJS 12, see
  `UPGRADE-NOTES.md` section 2).
- Priority **nx > angular > nestjs**, one migration at a time (they all change `package.json` and the lockfile).
  A newer eligible version of the same group supersedes an open migration (merge request closed, branch deleted).
  A version whose merge request you closed without merging is not proposed again.

## Commands

- Plan without changes: `node tools/scripts/framework-watch.mjs` (registry lookups only, no token).
- Complete or check a group locally: `node tools/scripts/align-framework-group.mjs [nx|angular|nestjs] [--latest] [--dry-run]`.
- NestJS only (no migrations): `sh tools/scripts/update-nestjs-packages.sh` (= `align-framework-group.mjs nestjs --latest`).
- A migration by hand follows the same path: create the branch `migrate/<leader>/<version>` with an eligible version
  (check with the watch first), or run `pnpm nx migrate <leader>@<version>`, `pnpm install`,
  `pnpm nx migrate --run-migrations`, `pnpm post-migrate` locally.

## When a migration fails

- **A member too young** (`align-framework-group.mjs: NOT eligible` in the post-migrate log, or `supply-chain:check`
  red): nx migrate pulled in a version that has not passed its cooldown (e.g. through Nx's `packageJsonUpdates`).
  Close the merge request; the watch proposes the version again once all members are old enough (closing a merge
  request blocks only that exact version).
- **Build / test / lint red:** the fix agent runs on the merge request pipeline. It never changes versions,
  exceptions or tests to make the pipeline green. When it gives up (`agent-fix::gave-up`), fix the branch by hand.

## Activation (at the final push, together with `RENOVATE.md`)

1. CI variable `GITLAB_TOKEN`: project access token (role *Developer*, scopes `api` and `write_repository`, expiry
   date; masked and hidden). Used by the watch (create / delete branches, close merge requests), `nx-migrate` (push,
   merge request) and the fix agent. **Not protected** unless `migrate/*` and `renovate/*` are protected branches:
   `nx-migrate` and the agent run on those branches, and protected variables only reach protected branches.
2. Schedule `Framework watch`: daily, target branch `development`, variable `FRAMEWORK_WATCH=true`.
3. `migrate/*` branches: allowed to push for the token's bot user.
4. Run the schedule once by hand: the job log lists the plan of every group (`pending ...` lines explain what waits).
