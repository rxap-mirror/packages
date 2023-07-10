import {
  formatFiles,
  generateFiles,
  GeneratorsJson,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  readJson,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import * as path from 'path';
import { SchematicGeneratorSchema } from './schema';
import { PackageJson } from 'nx/src/utils/package-json';

type NormalizedSchema = SchematicGeneratorSchema & ReturnType<typeof names> & {
  fileName: string;
  className: string;
  projectRoot: string;
  projectSourceRoot: string;
  npmScope: string;
  npmPackageName: string;
};

function normalizeOptions(host: Tree, options: SchematicGeneratorSchema): NormalizedSchema {
  const { npmScope } = getWorkspaceLayout(host);

  const {
    root: projectRoot,
    sourceRoot: projectSourceRoot,
  } = readProjectConfiguration(host, options.project);

  const npmPackageName = readJson<{ name: string }>(host, path.join(projectRoot, 'package.json')).name;

  let description: string;
  if (options.description) {
    description = options.description;
  } else {
    description = `${ options.name } schematic`;
  }

  return {
    ...options, ...names(options.name),
    description,
    projectRoot,
    projectSourceRoot,
    npmScope,
    npmPackageName,
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  generateFiles(host, path.join(__dirname, './files/schematic'), `${ options.projectSourceRoot }/schematics`, {
    ...options,
    schematicFnName: `${ options.propertyName }Schematic`,
    schemaInterfaceName: `${ options.className }SchematicSchema`,
  });
}

export async function createCollectionJson(host: Tree, projectRoot: string) {
  updateJson<PackageJson>(host, joinPathFragments(projectRoot, 'package.json'), (json) => {
    json.schematics ??= './collection.json';
    return json;
  });
  writeJson<GeneratorsJson>(host, joinPathFragments(projectRoot, 'collection.json'), {
    schematics: {},
  });
}

async function updateCollectionJson(host: Tree, options: NormalizedSchema) {
  const packageJson = readJson<PackageJson>(host, joinPathFragments(options.projectRoot, 'package.json'));
  const packageJsonSchematics = packageJson.schematics;
  let schematicsPath = packageJsonSchematics ? joinPathFragments(options.projectRoot, packageJsonSchematics) : null;

  if (!schematicsPath) {
    schematicsPath = joinPathFragments(options.projectRoot, 'collection.json');
  }
  if (!host.exists(schematicsPath)) {
    await createCollectionJson(host, options.projectRoot);
  }

  updateJson<GeneratorsJson>(host, schematicsPath, (json) => {
    let schematics = json.schematics;
    schematics ??= {};
    schematics[options.name] = {
      factory: `./src/schematics/${ options.fileName }/index`,
      schema: `./src/schematics/${ options.fileName }/schema.json`,
      description: options.description,
    };
    json.schematics = schematics;
    return json;
  });
}

export function hasSchematic(tree: Tree, projectName: string, schematicName: string): boolean {
  const project = readProjectConfiguration(tree, projectName);
  const packageJson = readJson<PackageJson>(tree, joinPathFragments(project.root, 'package.json'));
  if (!packageJson.schematics) {
    return false;
  }
  const schematicsPath = joinPathFragments(project.root, packageJson.schematics);
  const collectionJson = readJson<GeneratorsJson>(tree, schematicsPath);
  return (
    collectionJson.schematics?.[schematicName] !== undefined
  );
}

function coerceBuildTarget(
  tree: Tree,
  {
    projectRoot,
    project,
  }: NormalizedSchema,
) {

  const projectConfiguration = readProjectConfiguration(tree, project);

  projectConfiguration.targets ??= {};
  projectConfiguration.targets['build'] ??= {};
  const buildTarget = projectConfiguration.targets['build'];

  buildTarget.executor = '@nx/js:tsc';
  buildTarget.outputs ??= [ '{options.outputPath}' ];
  buildTarget.options ??= {};
  buildTarget.options.outputPath = `dist/${ projectRoot }`;
  buildTarget.options.main = `${ projectRoot }/src/index.ts`;
  buildTarget.options.tsConfig = `${ projectRoot }/tsconfig.lib.json`;
  buildTarget.options.assets ??= [];

  const assets = [
    `${ projectRoot }/*.md`, {
      'input': `./${ projectRoot }/src`,
      'glob': '**/!(*.ts)',
      'output': './src',
    }, {
      'input': `./${ projectRoot }/src`,
      'glob': '**/*.d.ts',
      'output': './src',
    }, {
      'input': `./${ projectRoot }`,
      'glob': 'collection.json',
      'output': '.',
    },
  ];

  for (const asset of assets) {
    if (!buildTarget.options.assets.some(a => {
      if (typeof asset === typeof a) {
        if (typeof asset === 'string') {
          return asset === a;
        } else {
          return asset.input === a.input && asset.glob === a.glob && asset.output === a.output;
        }
      }
    })) {
      buildTarget.options.assets.push(asset);
    }
  }

  updateProjectConfiguration(tree, project, projectConfiguration);
}

export async function schematicGenerator(host: Tree, _options: SchematicGeneratorSchema) {
  const options = normalizeOptions(host, _options);
  if (hasSchematic(host, options.project, options.name)) {
    throw new Error(`Generator ${ options.name } already exists.`);
  }

  addFiles(host, options);

  await updateCollectionJson(host, options);

  if (!options.skipFormat) {
    await formatFiles(host);
  }

  coerceBuildTarget(host, options);

}

export default schematicGenerator;
