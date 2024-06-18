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
  // yarn
  '.yarn/*',
  '!yarn.lock',
  '!.yarn/patches',
  '!.yarn/plugins',
  '!.yarn/releases',
  '!.yarn/sdks',
  '!.yarn/versions',
  // '!.yarn/cache',
  'documentation.json',
  'gitlab-ci-setup.sh',
  // .idea
  '.idea/copilot/chatSessions',
  '.idea/jsLibraryMappings.xml',
  '.idea/nx-angular-config.xml',
  '.idea/nx-console.xml',
  '.idea/cody_history.xml',
  '.idea/JetClient',
  '.idea/shelf/',
  '.idea/workspace.xml',
  '.idea/httpRequests/',
  '.idea/developer-tools.xml',
];
export const prettierIgnore = [
  'dist',
  'coverage',
  '.angular',
  '.yarn',
  '*.handlebars',
  'node_modules',
  'tmp',
  'tmp.*',
  '.nx',
  '.nyc_output',
];
