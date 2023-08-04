import {
  generateFiles,
  Tree,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/generator-utilities';
import { ApplicationInitGenerator } from '@rxap/plugin-application';
import { LibraryInitGenerator } from '@rxap/plugin-library';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';

const gitIgnore = [
  // nx
  '/migrations.json',
  // angular
  '.angular',
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
  '*.log',
  '*.lock',
  '*.patch',
  'typings',
  '.env',
  // system files
  '.DS_Store',
  'Thumbs.db',
  // yarn
  '.yarn/*',
  '!.yarn/patches',
  '!.yarn/plugins',
  '!.yarn/releases',
  '!.yarn/sdks',
  '!.yarn/versions',
  '!.yarn/cache',
];

const prettierIgnore = [
  'dist',
  'coverage',
  '.angular',
  '.yarn',
  '*.handlebars',
  'node_modules',
  'tmp',
  'tmp.*',
];

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  generateFiles(tree, join(__dirname, 'files'), tree.root, { tmpl: '' });

  CoerceIgnorePattern(tree, '.gitignore', gitIgnore);
  CoerceIgnorePattern(tree, '.prettierignore', prettierIgnore);

  await LibraryInitGenerator(tree, {});
  await ApplicationInitGenerator(tree, {});
}

export default initGenerator;
