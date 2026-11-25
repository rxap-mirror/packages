# Nx 24 / Angular 22.3 / NestJS 12 upgrade – known issues and exit criteria

Status (2026-11-22): workspace runs Nx 24.0.6, Angular 22.3.0, TypeScript 6.0.3, NestJS 12.6.0. Build, lint and test are green.
Two things are only possible because of workarounds for Nx releases that do not support this combination yet.

## 1. `nx` patch (Angular 22.3)

- **Symptom:** every target that uses an Angular CLI builder (`@angular-devkit/build-angular:*`, e.g. `demos/angular`,
  `applications/prism-host`) fails with
  `Package subpath './node/index' is not defined by "exports" in @angular-devkit/architect/package.json`.
- **Cause:** `nx/dist/src/adapter/ngcli-adapter.js` imports `@angular-devkit/architect/node/index.js`; the architect
  package shipped with Angular 22.3 only exports `./node`.
- **Upstream:** issue [nrwl/nx#37955](https://github.com/nrwl/nx/issues/37955) (open), fixed on `master` by
  [PR #37951](https://github.com/nrwl/nx/pull/37951) (merged 2026-11-19). Not in 24.0.6 nor in `24.1.0-beta.2`
  (2026-11-18). Whether it is backported to the 24.0.x line is not confirmed.
- **Workaround:** `patches/nx@24.0.6.patch` (registered in `pnpm-workspace.yaml` `patchedDependencies` as `nx@24.0.6`)
  changes the import to `@angular-devkit/architect/node`.
- **Remove when:** a released Nx version contains PR #37951 (24.0.7 backport or 24.1.x). Then delete the patch file and
  the `patchedDependencies` entry, run `pnpm install`.
- `@nx/angular@24.0.6` declares Angular `>=20 <23`, so 22.3 is supported on paper; the generators default to `~22.2.0`.

## 2. `@nx/nest` does not support NestJS 12 yet

- **Symptom:** `@nx/nest@24.0.6` peers are `@nestjs/core|common >=10 <12` (peer warnings); the
  `@nx/nest:application` generator scaffolds Nest 11 dependencies (`^11.0.0`) and hardcodes webpack.
- **Upstream:** NestJS 12 support merged on `master` ([PR #36937](https://github.com/nrwl/nx/pull/36937), 2026-11-04,
  closes #36936). `@nx/nest@24.1.0-beta.2` already allows `<13`. The webpack hardcoding is a separate, open enhancement
  ([#36913](https://github.com/nrwl/nx/issues/36913)).
- **Impact here:** none on our libraries (built with `@nx/js:tsc`, tests green on Nest 12). Only apps generated through
  `@nx/nest` or the `@rxap/plugin-nestjs` generators get Nest 11 versions and have to be bumped by hand; the
  `@rxap/plugin-nestjs` generators still emit `@nx/webpack:webpack` targets (executor removed in Nx 24).
- **Remove when:** Nx 24.1 is stable and past its cooldown → the framework watch opens the migration
  (`migrate/nx/24.1.x`, `FRAMEWORK-WATCH.md`); re-check peer warnings for `@nx/nest`, and
  modernise the `@rxap/plugin-nestjs` application generators (inferred webpack/rspack plugin instead of the executor).

## 3. Release cadence (basis for "when can we drop the workarounds")

Official policy: <https://nx.dev/docs/reference/releases> – `nx` and all `@nx/*` packages are released in lockstep; a new
major roughly every six months; minors "less frequently"; patches "as needed"; the previous major becomes LTS (security
and critical fixes only) for 12 months. v24 is Current (2026-10-21), v23 and v22 are LTS.

Observed (GitHub releases, `nrwl/nx`):

| Release | beta.0 | GA | beta → GA |
| --- | --- | --- | --- |
| 23.2.0 | 2026-07-17 | 2026-09-02 | 47 days |
| 23.3.0 | 2026-09-08 | 2026-10-07 | 29 days |
| 24.0.0 (major) | 2026-10-13 | 2026-10-21 | 8 days |
| 24.1.0 | 2026-11-10 | not yet (beta.2 on 2026-11-18) | – |

- Minor GA gaps: 23.1.0 (07-13) → 23.2.0 (09-02) → 23.3.0 (10-07) → 24.0.0 (10-21).
- Patches on 24.0.x came every 3–7 days (24.0.1 on 10-23 … 24.0.6 on 11-10), none since 11-10; 23.3.3 shipped 11-20.
- **Estimate (inference, not a statement from the Nx team):** 24.1.0 GA most likely in early to mid December 2026
  (beta → GA took 4–7 weeks for the last minors), possibly slipping past the holidays. A 24.0.7 with the architect fix
  could come earlier, but is not announced.
- Re-check: `gh release list --repo nrwl/nx --limit 15` and the two upstream issues above, or
  `node tools/scripts/framework-watch.mjs` (which Nx / Angular / NestJS version is eligible, and what still waits).

## 4. Dependency upgrade policy (release cooldown)

Supply-chain rule: **never install the newest release.** A version is only eligible once it has been public for a
cooldown that depends on how widely the package is used (weekly npm downloads):

| Weekly downloads | Cooldown |
| --- | --- |
| >= 1,000,000 | 7 days |
| >= 100,000 | 14 days |
| below | 30 days (also used when the download count cannot be determined) |

Tooling (pnpm's `minimumReleaseAge` is a flat floor without popularity tiers, so the tiered checks are ours):

- `node tools/scripts/dependency-cooldown.mjs [--apply] [--only a,b] [--status minor|major] [--pin name=range]`
  picks, per root dependency, the newest stable version that is old enough, never leaves the `latest` dist-tag,
  skips deprecated versions and only accepts versions whose peerDependencies hold in **both** directions against
  the versions the workspace pins (so the highest *compatible* major is chosen, e.g. TypeScript stays on 6.0 while
  Angular 22 requires `<6.1`). `--apply` writes **exact** versions: a `^` range lets the package manager float to a release that
  never went through the cooldown.
- `node tools/scripts/align-framework-dep-versions.mjs` copies the root ranges verbatim into every package (a
  different range would resolve separately and install a second copy) and widens `peerDependencies` to the major.
- `node tools/scripts/audit-lockfile-cooldown.mjs <base-ref> [--write-resolutions]` checks every **transitive**
  version that a lockfile change introduced and pins offenders via `pnpm-workspace.yaml` `overrides` (key `name@range`, the
  ranges the dependents request). Drop those pins once the floating version has aged enough.

Peer ranges of published packages are the major (`^22.0.0`, `^0.20.0` for 0.x), not the version the workspace is
built with: `fix-dependencies` (`@rxap/plugin-library`) generates them that way.

### Enforcement (since 2026-11-25)

- **pnpm floor** (`pnpm-workspace.yaml`): `minimumReleaseAge: 10080` (7 days, strict) makes pnpm refuse any version
  below the lowest tier, also for a hand-typed `pnpm add`, and verifies the lockfile on every install.
  `trustPolicy: no-downgrade` refuses a version published with less trust (provenance / trusted publisher) than an
  earlier one; `trustPolicyExclude` lists the reviewed exceptions.
- **`pnpm supply-chain:check [<base-ref>]`** (`tools/scripts/supply-chain-check.mjs`): the tiered cooldown of every
  version the lockfile change adds (base: merge base with the upstream branch, else `origin/development`) plus
  `pnpm audit` at high/critical. Run it after every dependency change.
- **Husky `pre-push`** runs the check when the push changes `pnpm-lock.yaml` or `pnpm-workspace.yaml`
  (skip with `SKIP_SUPPLY_CHAIN=1 git push`). CI and Renovate will run the same script later.
- Never install with `npx <pkg>` / `pnpm dlx <pkg>` without an exact, cooldown-checked version: they bypass the
  lockfile. `rxap:update` and `tools/scripts/update-nestjs-packages.sh` go through the cooldown tooling.

- **Renovate** (`RENOVATE.md`) proposes updates only after the cooldown (`minimumReleaseAge` 30 days by default,
  7/14 days from the generated `renovate-tiers.json`), runs `tools/scripts/renovate-post-upgrade.mjs` on every branch
  and automerges patch/minor only after a green pipeline including `supply-chain:check`. In CI the check runs on every
  merge request that changes dependencies, plus a daily scheduled `supply-chain:audit`.

**Exceptions** (also for a security fix whose patched version is still too young) are manual and dated:

- too young: an exact `name@version` entry in `minimumReleaseAgeExclude` below a comment
  `# <reason>: remove after YYYY-MM-DD` (the date covers every entry up to the next such comment), plus an exact pin in
  `overrides` where needed. `supply-chain:check` fails once the date has passed.
- known advisory without a usable fix: an entry in `tools/scripts/audit-allowlist.json` with `id` (GHSA),
  `package`, `reason` and `expires`; an expired entry fails the check.

State on 2026-11-25: the versions locked by the 2026-11-22 framework upgrade (one day before the cooldown rule) are
dated `minimumReleaseAgeExclude` entries, the last ones drop out on 2026-12-16. `pnpm audit --fix update` plus four
same-major overrides (`ws`, `protobufjs` 6, `@grpc/grpc-js`, `semver` 7) fixed 42 of 64 high/critical advisories; the
22 left are allowlisted until 2026-12-25 (xmldom in `@rxap/xml-parser`, the legacy web3.storage/ipfs stack, zod 3 and
langsmith via `@langchain/*` 0.3, query-string's `decode-uri-component`).

### Deliberately not at the newest major (2026-11-23)

| Package | Stays on | Reason |
| --- | --- | --- |
| `typescript` | 6.0.3 | Angular 22 (`@angular/compiler-cli`, `@angular-devkit/build-angular`) requires `<6.1`; TS 7 is rejected |
| `@types/node` | 22.x | typings follow the minimum supported Node runtime (`engines.node >=22`) |
| `tailwindcss` | 3.x | v4 is a migration (config format, `@tailwindcss/postcss`, the `RXAP_TAILWIND_CONFIG` preset and the app generators), not a version bump |
| `@langchain/*`, `langchain` | 0.3.x | `@langchain/community` 1.x is deprecated upstream. It is only used by the litellm n8n node (document loaders). Its optional peer ranges for `typeorm`, `ignore` and `firebase-admin` are deliberately ignored (`dependency-cooldown.mjs --ignore-peers-of @langchain/community`), pnpm prints peer warnings for them |
| `jsdom` | 26.1.0 | 27+ pulls ESM-only dependencies (`@exodus/bytes`, `bcp-47`, ...) that the CommonJS jest runtime cannot load |
| `webpack-dev-server` / `verdaccio` | 5.x / 6.x | `@nx/webpack` / `@nx/js` peer ranges |

`@csstools/*` (via `postcss-preset-env` 11.6.2) resolved to releases that were only 6.1 days old on 2026-11-23 and
have no older version inside the parent's range; re-run `audit-lockfile-cooldown.mjs` after 2026-11-24.

### Breaking changes of the 2026-11-23 upgrade for consumers

- `@rxap/nest-typeorm`: typeorm 1 removed the `sqlite` (sqlite3) driver. `TYPEORM_TYPE=sqlite` now configures
  `better-sqlite3`, apps that use it have to install `better-sqlite3` instead of `sqlite3`.
- `@rxap/nest-firebase`: uses the modular `firebase-admin` API (firebase-admin >= 13); `FirebaseApp`, `FirebaseUser`
  and `Firestore` are the types of `firebase-admin/app`, `/auth` and `/firestore`.
- `@rxap/nest-auth0`: auth0 7 dropped the authentication client from its main entrypoint; the services import from
  `auth0/legacy` (API unchanged).
- `@rxap/nest-keyv-minio`: implements the keyv 6 storage adapter contract (bulk methods, event emitter).
