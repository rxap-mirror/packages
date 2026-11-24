import { PackageManagerProfile } from '@rxap/workspace-utilities';

export const gitIgnore = [
  // nx
  '/migrations.json',
  // chrome
  '~',
  // angular
  '.angular',
  // nx
  '.nx',
  // rxap
  '/docker-compose.frontends.yml',
  '/docker-compose.services.yml',
  // compiled output
  'dist',
  'tmp',
  'tmp.*',
  '/out-tsc',
  // dependencies
  'node_modules',
  // IDEs and editors
  '.project',
  '.classpath',
  '.c9',
  '*.launch',
  '.settings/',
  '*.sublime-workspace',
  // IDE - VSCode
  '.vscode/*',
  '!.vscode/settings.json',
  '!.vscode/tasks.json',
  '!.vscode/launch.json',
  '!.vscode/extensions.json',
  // misc
  '.sass-cache',
  'connect.lock',
  'coverage',
  '.nyc_output',
  '*.log',
  '*.lock',
  '*.patch',
  'typings',
  '.env',
  'junit.xml',
  '/junit',
  'nx-angular-config.xml',
  'nx-config.xml',
  // system files
  '.DS_Store',
  'Thumbs.db',
  'documentation.json',
  'gitlab-ci-setup.sh',
  // .idea
  '.idea/copilot/chatSessions',
  '.idea/jsLibraryMappings.xml',
  '.idea/nx-angular-config.xml',
  '.idea/nx-console.xml',
  '.idea/cody_history.xml',
  '.idea/JetClient',
  '.idea/vcs.xml',
  '.idea/shelf/',
  '.idea/workspace.xml',
  '.idea/httpRequests/',
  '.idea/developer-tools.xml',
  '.idea/dataSources/*/storage_v2',
  // firebase
  '.firebase'
];
export const prettierIgnore = [
  'dist',
  'coverage',
  '.angular',
  '*.handlebars',
  'node_modules',
  'tmp',
  'tmp.*',
  '.nx',
  '.nyc_output',
];

/**
 * The .gitignore entries that only apply to one package manager (its install state and CI cache dir)
 */
export function gitIgnoreForPackageManager(packageManager: Pick<PackageManagerProfile, 'name' | 'ciCacheDir'>): string[] {
  switch (packageManager.name) {
    case 'yarn':
      return [
        // the lockfile must be committed even though '*.lock' is ignored
        '!yarn.lock',
        '.yarn/*',
        '!.yarn/patches',
        '!.yarn/plugins',
        '!.yarn/releases',
        '!.yarn/sdks',
        '!.yarn/versions',
      ];
    case 'bun':
      return [ '!bun.lock', packageManager.ciCacheDir ];
    default:
      return [ packageManager.ciCacheDir ];
  }
}

/**
 * The .prettierignore entries that only apply to one package manager
 */
export function prettierIgnoreForPackageManager(packageManager: Pick<PackageManagerProfile, 'name'>): string[] {
  return packageManager.name === 'yarn' ? [ '.yarn' ] : [];
}
