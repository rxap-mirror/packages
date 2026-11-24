import { TreeAdapter, TreeLike } from './tree';

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

export const PACKAGE_MANAGER_NAMES: ReadonlyArray<PackageManagerName> = [ 'npm', 'yarn', 'pnpm', 'bun' ];

/**
 * Lockfiles in detection order. If a workspace contains more than one, the first match wins.
 */
export const PACKAGE_MANAGER_LOCKFILES: ReadonlyArray<[ string, PackageManagerName ]> = [
  [ 'pnpm-lock.yaml', 'pnpm' ],
  [ 'yarn.lock', 'yarn' ],
  [ 'package-lock.json', 'npm' ],
  [ 'npm-shrinkwrap.json', 'npm' ],
  [ 'bun.lock', 'bun' ],
  [ 'bun.lockb', 'bun' ],
];

export interface ResolvedPackageManager {
  name: PackageManagerName;
  /**
   * The version from the root package.json `packageManager` field, if present
   */
  version?: string;
}

export function IsPackageManagerName(value: unknown): value is PackageManagerName {
  return typeof value === 'string' && (PACKAGE_MANAGER_NAMES as string[]).includes(value);
}

/**
 * Parses a `packageManager` field value like `pnpm@10.4.1+sha512.abc` into its name and version.
 */
export function ParsePackageManagerField(value: unknown): ResolvedPackageManager | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.trim().match(/^(npm|yarn|pnpm|bun)(?:@([^+\s]+))?/);
  if (!match) {
    return null;
  }
  return {
    name: match[1] as PackageManagerName,
    version: match[2],
  };
}

function readRootFile(tree: TreeLike, file: string): string | null {
  if (!tree.exists(file)) {
    return null;
  }
  return new TreeAdapter(tree).read(file)?.toString('utf-8') ?? null;
}

/**
 * Determines the package manager of the workspace represented by the tree.
 *
 * Order: explicit override, then the root package.json `packageManager` field, then the lockfile in the
 * workspace root, then `npm`. If the field names a manager whose lockfile is missing while exactly one other
 * lockfile exists, the lockfile wins. Works with Nx generator trees, Angular schematic trees and the FsTree, and never
 * reads from the real file system or spawns a process.
 */
export function ResolvePackageManager(tree: TreeLike, override?: PackageManagerName | null): ResolvedPackageManager {
  const packageJsonContent = readRootFile(tree, 'package.json');
  let fromField: ResolvedPackageManager | null = null;
  if (packageJsonContent) {
    try {
      fromField = ParsePackageManagerField(JSON.parse(packageJsonContent).packageManager);
    } catch {
      // an invalid package.json is not our concern here
    }
  }
  if (override) {
    return {
      name: override,
      version: fromField?.name === override ? fromField.version : undefined,
    };
  }
  const fromLockfiles = new Set(PACKAGE_MANAGER_LOCKFILES.filter(([ lockfile ]) => tree.exists(lockfile)).map(([ , name ]) => name));
  if (fromField) {
    // a stale field (e.g. the `yarn@3.6.0` older rxap versions always wrote) loses against an unambiguous lockfile
    if (fromLockfiles.size === 1 && !fromLockfiles.has(fromField.name)) {
      return { name: [ ...fromLockfiles ][0] };
    }
    return fromField;
  }
  for (const [ , name ] of PACKAGE_MANAGER_LOCKFILES) {
    if (fromLockfiles.has(name)) {
      return { name };
    }
  }
  return { name: 'npm' };
}

/**
 * Yarn 1 (classic) vs. yarn >= 2 (berry). Without a version, berry is assumed if a `.yarnrc.yml` exists or
 * no `.yarnrc` (classic config) exists.
 */
export function IsYarnClassic(tree: TreeLike | null, packageManager: ResolvedPackageManager): boolean {
  if (packageManager.name !== 'yarn') {
    return false;
  }
  if (packageManager.version) {
    return packageManager.version.startsWith('1.');
  }
  if (!tree) {
    return false;
  }
  return !tree.exists('.yarnrc.yml') && tree.exists('.yarnrc');
}

export interface PackageManagerProfile {
  name: PackageManagerName;
  /** `true` for yarn 1 */
  classic: boolean;
  /** Install with lockfile updates allowed */
  install: string;
  /** Install from the lockfile only, fails if it is out of date */
  ciInstall: string;
  /** Install only production dependencies from the lockfile (e.g. in a Dockerfile) */
  prodInstall: string;
  add: string;
  addDev: string;
  /** Prefix to run a package.json script, e.g. `pnpm run` */
  runPrefix: string;
  /** Prefix to run a binary of an installed package, e.g. `pnpm exec` */
  execPrefix: string;
  /** Prefix to download and run a package without installing it, e.g. `pnpm dlx` */
  dlxPrefix: string;
  lockfile: string;
  /** Workspace-relative cache/store directory that CI should cache between jobs */
  ciCacheDir: string;
  cacheClean: string;
  /**
   * Dockerfile instructions that make the package manager available in a `node` image (empty for npm). Corepack is
   * installed explicitly because node >= 25 no longer bundles it.
   */
  dockerSetup: string;
  run: (script: string, args?: string) => string;
  exec: (bin: string, args?: string) => string;
  dlx: (pkg: string, args?: string) => string;
}

const COREPACK_DOCKER_SETUP = 'ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0\nRUN npm install -g corepack && corepack enable';

const DOCKER_SETUP: Record<PackageManagerName, string> = {
  npm: '',
  yarn: COREPACK_DOCKER_SETUP,
  pnpm: COREPACK_DOCKER_SETUP,
  bun: 'RUN npm install -g bun',
};

function withArgs(command: string, args?: string) {
  return args ? `${ command } ${ args }` : command;
}

/**
 * A static, deterministic description of the commands and files of a package manager. Unlike
 * `getPackageManagerCommand` from `@nx/devkit` it never spawns a process, so it can be used to render files.
 */
export function GetPackageManagerProfile(
  packageManager: PackageManagerName | ResolvedPackageManager,
  tree: TreeLike | null = null,
): PackageManagerProfile {
  const resolved: ResolvedPackageManager = typeof packageManager === 'string' ? { name: packageManager } : packageManager;
  const classic = IsYarnClassic(tree, resolved);
  let profile: Omit<PackageManagerProfile, 'run' | 'exec' | 'dlx' | 'name' | 'classic' | 'dockerSetup'>;
  switch (resolved.name) {
    case 'pnpm':
      profile = {
        install: 'pnpm install',
        ciInstall: 'pnpm install --frozen-lockfile',
        prodInstall: 'pnpm install --prod --frozen-lockfile',
        add: 'pnpm add',
        addDev: 'pnpm add -D',
        runPrefix: 'pnpm run',
        execPrefix: 'pnpm exec',
        dlxPrefix: 'pnpm dlx',
        lockfile: 'pnpm-lock.yaml',
        ciCacheDir: '.pnpm-store',
        cacheClean: 'pnpm store prune',
      };
      break;
    case 'yarn':
      profile = classic ? {
        install: 'yarn install',
        ciInstall: 'yarn install --frozen-lockfile',
        prodInstall: 'yarn install --production --frozen-lockfile',
        add: 'yarn add',
        addDev: 'yarn add -D',
        runPrefix: 'yarn',
        execPrefix: 'yarn',
        dlxPrefix: 'npx --yes',
        lockfile: 'yarn.lock',
        ciCacheDir: '.yarn-cache',
        cacheClean: 'yarn cache clean',
      } : {
        install: 'yarn install',
        ciInstall: 'yarn install --immutable',
        prodInstall: 'yarn workspaces focus --all --production',
        add: 'yarn add',
        addDev: 'yarn add -D',
        runPrefix: 'yarn',
        execPrefix: 'yarn',
        dlxPrefix: 'yarn dlx',
        lockfile: 'yarn.lock',
        ciCacheDir: '.yarn/cache',
        cacheClean: 'yarn cache clean --all',
      };
      break;
    case 'bun':
      profile = {
        install: 'bun install',
        ciInstall: 'bun install --frozen-lockfile',
        prodInstall: 'bun install --production --frozen-lockfile',
        add: 'bun add',
        addDev: 'bun add -d',
        runPrefix: 'bun run',
        execPrefix: 'bunx',
        dlxPrefix: 'bunx',
        lockfile: 'bun.lock',
        ciCacheDir: '.bun-cache',
        cacheClean: 'bun pm cache rm',
      };
      break;
    case 'npm':
    default:
      profile = {
        install: 'npm install',
        ciInstall: 'npm ci',
        prodInstall: 'npm ci --omit=dev',
        add: 'npm install',
        addDev: 'npm install -D',
        runPrefix: 'npm run',
        execPrefix: 'npx',
        dlxPrefix: 'npx --yes',
        lockfile: 'package-lock.json',
        ciCacheDir: '.npm',
        cacheClean: 'npm cache clean --force',
      };
      break;
  }
  return {
    ...profile,
    name: resolved.name,
    classic,
    dockerSetup: DOCKER_SETUP[resolved.name] ?? '',
    // npm needs `--` to forward arguments to the script
    run: (script, args) => withArgs(`${ profile.runPrefix } ${ script }`, args && resolved.name === 'npm' ? `-- ${ args }` : args),
    exec: (bin, args) => withArgs(`${ profile.execPrefix } ${ bin }`, args),
    dlx: (pkg, args) => withArgs(`${ profile.dlxPrefix } ${ pkg }`, args),
  };
}

/**
 * Shortcut for `GetPackageManagerProfile(ResolvePackageManager(tree, override), tree)`
 */
export function ResolvePackageManagerProfile(tree: TreeLike, override?: PackageManagerName | null): PackageManagerProfile {
  return GetPackageManagerProfile(ResolvePackageManager(tree, override), tree);
}

/**
 * The standard `{{pm.*}}` substitutions for `CoerceFilesStructure` templates (files with a `.template` suffix).
 *
 * `{{pm.name}}`, `{{pm.run}}` (prefix to run a script), `{{pm.exec}}` (prefix to run a binary), `{{pm.dlx}}`,
 * `{{pm.install}}`, `{{pm.ciInstall}}`, `{{pm.prodInstall}}`, `{{pm.add}}`, `{{pm.addDev}}`, `{{pm.lockfile}}`,
 * `{{pm.cacheDir}}`, `{{pm.cacheClean}}` and `{{pm.dockerSetup}}` (Dockerfile lines, empty for npm).
 */
export function PackageManagerSubstitutions(profile: PackageManagerProfile): Record<string, string> {
  return {
    'pm.name': profile.name,
    'pm.run': profile.runPrefix,
    'pm.exec': profile.execPrefix,
    'pm.dlx': profile.dlxPrefix,
    'pm.install': profile.install,
    'pm.ciInstall': profile.ciInstall,
    'pm.prodInstall': profile.prodInstall,
    'pm.add': profile.add,
    'pm.addDev': profile.addDev,
    'pm.lockfile': profile.lockfile,
    'pm.cacheDir': profile.ciCacheDir,
    'pm.cacheClean': profile.cacheClean,
    'pm.dockerSetup': profile.dockerSetup,
  };
}

/**
 * Replaces every `{{key}}` (whitespace inside the braces allowed) with the matching substitution. Unknown keys are
 * left untouched, so other template syntaxes (handlebars, GitLab `$[[ inputs ]]`, shell `${VAR}`) survive.
 */
export function ApplySubstitutions(content: string, substitutions: Record<string, string>): string {
  return content.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(substitutions, key) ? substitutions[key] : match);
}
