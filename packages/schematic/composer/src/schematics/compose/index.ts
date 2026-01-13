import {
  chain,
  externalSchematic,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { HasProjectFeature } from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDevDependencyRule,
  GlobalOptions,
} from '@rxap/schematics-utilities';
import {
  coerceArray,
  CoercePrefix,
  dasherize,
  DeleteUndefinedProperties,
  equals,
  Normalized,
} from '@rxap/utilities';
import {
  GetProject,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetRootPackageJson,
  HasProjectSourceRoot,
  IsLibraryProject,
  VisitTree,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { parse } from 'yaml';
import { ComposeSchematicSchema } from './schema';
import 'colors';

interface SchematicCommand {
  package: string;
  name: string;
  options: Record<string, any>;
}

function detectedFeature(schematicCommandFilePath: string): string | undefined {
  const fragments = schematicCommandFilePath.split('/').reverse();
  let last = fragments.pop();
  for (const fragment of fragments) {
    if (['lib', 'app', 'src'].includes(fragment)) {
      return undefined;
    }
    if (fragment === 'feature') {
      return last;
    }
    last = fragment;
  }
  return undefined;
}

function detectedProject(host: Tree, schematicCommandFilePath: string): string | undefined {
  const fragments = schematicCommandFilePath.split('/');
  fragments.pop();
  while (fragments.length) {
    const path = fragments.join('/');
    if (host.exists(join(path, 'project.json'))) {
      const content = JSON.parse(host.read(join(path, 'project.json'))!.toString('utf-8'));
      if (content.name) {
        return content.name;
      }
    }
    fragments.pop();
  }
  return undefined;
}

function parseSchematicCommandFile(host: Tree, filePath: string): SchematicCommand[] {
  console.log(`Parse schematic command file '${ filePath }'`.grey);

  const schematicCommandFile = host.read(filePath)?.toString('utf-8');

  if (!schematicCommandFile) {
    throw new SchematicsException(`The schematic command file '${ filePath }' does not exists!`);
  }

  let parsed: SchematicCommand | SchematicCommand[];

  switch (filePath.split('.').pop()) {
    case 'json':
      parsed = JSON.parse(schematicCommandFile);
      break;
    case 'yml':
    case 'yaml':
      parsed = parse(schematicCommandFile);
      break;
    default:
      throw new SchematicsException(`The schematic command file '${ filePath }' has an unsupported file extension!`);
  }

  return coerceArray(parsed);

}

function executeSchematicCommandFile(
  host: Tree,
  schematicCommandFilePath: string,
  globalOptions: Partial<GlobalOptions>,
) {

  const schematicCommandList: SchematicCommand[] = parseSchematicCommandFile(host, schematicCommandFilePath);

  const ruleList: Rule[] = [];

  for (const command of schematicCommandList) {
    if (!command.package) {
      throw new SchematicsException('The package name is required in the schematic command file!');
    }
    if (!command.name) {
      throw new SchematicsException('The name is required in the schematic command file!');
    }
    command.options ??= {};
    if (typeof command.options !== 'object') {
      throw new SchematicsException('The options must be an object!');
    }
    console.log(`Prepare schematic execution '${ command.package }:${ command.name }'`.grey);
    const options: { feature?: string, directory?: string, project?: string, overwrite?: boolean | string[] } & Record<string, any> = {
      ...globalOptions,
      ...command.options,
    };
    options.project ??= detectedProject(host, schematicCommandFilePath);
    options.feature ??= detectedFeature(schematicCommandFilePath);

    // region workaround for non-schematic packages that do not support an overwrite option as array
    if (Array.isArray(globalOptions.overwrite)) {
      if (!command.package.startsWith('@rxap/schematic')) {
        options.overwrite = true;
      }
    }
    // endregion

    if (options.project && HasProjectSourceRoot(host, options.project)) {
      const projectSourceRoot = GetProjectSourceRoot(host, options.project);
      const schematicCommandFolder = dirname(schematicCommandFilePath.replace(/^\//, ''));
      const directoryParts = relative(projectSourceRoot, schematicCommandFolder).split(
        '/');
      if (IsLibraryProject(GetProject(host, options.project))) {
        // if the project is a library project the lib directory is not part of the directory
        if (directoryParts[0] === 'lib') {
          directoryParts.shift();
        }
      }
      if (options.feature) {
        if (directoryParts[0] === 'feature') {
          directoryParts.shift();
        }
        if (directoryParts[0] === options.feature) {
          directoryParts.shift();
        }
      }
      if (directoryParts.length) {
        directoryParts.pop(); // remove schematics directory
      }
      if (directoryParts.length) {
        options.directory = directoryParts.join('/');
      }
    }
    ruleList.push(chain([
      () => console.log(`Execute schematic '${ command.package }:${ command.name }'`.green),
      () => { process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Input Options: ${ JSON.stringify(options) }`.grey); },
      // TODO : find a way to install the package if not exists before the external schematic is executed
      // this implementation will only trigger the node package installer task after the schematic is executed
      // AddPackageJsonDevDependencyRule(command.package, 'latest', { soft: true }),
      // (_, context) => {
      //   context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
      // },
      () => {
        try {
          return externalSchematic(command.package, command.name, DeleteUndefinedProperties(options));
        } catch (e) {
          console.error(`Error while executing schematic '${ command.package }:${ command.name }'`.red);
          console.log('Retry with this schematic with the command:'.grey);
          console.log(`nx g @rxap/schematic-composer:compose --project ${ options.project } --feature ${ options.feature } --filter ${ dirname(
            schematicCommandFilePath).split('/').pop() }`.grey);
          throw e;
        }
      },
    ]));
  }

  return chain(ruleList);
}

function getSchematicCommandList(host: Tree, sourceRoot: string) {
  const schematicCommandList: string[] = [];

  for (const {path, isFile} of VisitTree(host, sourceRoot)) {
    if (isFile) {
      if (path.match(/schematics?\.(json|yaml|yml)$/)) {
        schematicCommandList.push(path);
      }
    }
  }

  return schematicCommandList;
}

function getSchematicCommandRuleList(
  host: Tree,
  schematicCommandList: string[],
  globalOptions: Partial<GlobalOptions>,
) {
  const ruleList: Rule[] = [];

  for (const schematicCommandFilePath of schematicCommandList) {
    ruleList.push(chain([
      () => console.log(`Execute schematic command file '${ schematicCommandFilePath }'`.blue),
      executeSchematicCommandFile(host, schematicCommandFilePath, globalOptions),
    ]));
  }

  return chain(ruleList);
}

function executeSchematicCommand(
  host: Tree,
  sourceRoot: string,
  globalOptions: Partial<GlobalOptions>,
  filter: string | null,
) {
  let schematicCommandList = getSchematicCommandList(host, sourceRoot);

  if (filter) {
    schematicCommandList = schematicCommandList.filter(path => dirname(path).split('/').pop() === filter);
  }

  if (!schematicCommandList.length) {
    console.log('No schematic command files found in source root:'.yellow, sourceRoot);
  } else {
    console.log('Schematic Command List:'.blue);
    console.log(schematicCommandList.map(item => ` - ${ item }`).join('\n'));
  }

  console.log('Execute schematic command files.'.grey);

  return getSchematicCommandRuleList(host, schematicCommandList, globalOptions);
}

function forFeature(
  host: Tree,
  projectName: string,
  featureName: string,
  globalOptions: Partial<GlobalOptions>,
  filter: string | null,
) {

  const projectSourceRoot = GetProjectSourceRoot(host, projectName);
  const featureSourceRoot = join(projectSourceRoot, 'feature', featureName);

  console.log('Use feature source root:', featureSourceRoot);

  if (!HasProjectFeature(
    host,
    {
      project: projectName,
      feature: featureName,
    },
  )) {
    throw new SchematicsException(`The feature '${ featureName }' does not exists in project '${ projectName }'`);
  }

  return executeSchematicCommand(host, featureSourceRoot, globalOptions, filter);

}

function forProject(host: Tree, projectName: string, globalOptions: Partial<GlobalOptions>, filter: string | null) {

  const projectRoot = GetProjectRoot(host, projectName);

  console.log('Use project root:', projectRoot);

  return executeSchematicCommand(host, projectRoot, globalOptions, filter);

}

function forWorkspace(host: Tree, globalOptions: Partial<GlobalOptions>, filter: string | null, directory: string | null) {
  directory ??= '/';
  if (directory !== '/') {
    console.log(`Use directory: ${ directory } relative to workspace source root`);
  } else {
    console.log('Use workspace source root');
  }
  return executeSchematicCommand(host, CoercePrefix(directory, '/'), globalOptions, filter);

}

export interface NormalizedComposeSchematicSchema extends Readonly<Normalized<ComposeSchematicSchema>> {
  feature: string | null;
  project: string | null;
  filter: string | null;
  overwrite: boolean | string[];
}

function NormalizeComposeOptions(options: ComposeSchematicSchema): NormalizedComposeSchematicSchema {
  let overwrite = options.overwrite ?? false;
  if (typeof overwrite === 'string') {
    overwrite = overwrite.split(',');
  }
  return Object.seal({
    project: options.project ? dasherize(options.project) : null,
    feature: options.feature ? dasherize(options.feature) : null,
    filter: options.filter ?? null,
    overwrite: overwrite,
    replace: options.replace ?? false,
    directory: options.directory ?? null,
  });
}

export default function (options: ComposeSchematicSchema) {
  const normalizedOptions = NormalizeComposeOptions(options);
  const {
    project,
    feature,
    filter,
    overwrite,
    replace,
    directory,
  } = normalizedOptions;

  const globalOptions: Partial<GlobalOptions> = {
    // TODO : fix Normalized type support overwrite?: string[] | boolean;
    overwrite: overwrite as any,
    replace: replace,
    project: project ?? undefined,
    feature: feature ?? undefined,
  };

  return (host: Tree) => {

    const rootPackageJson = GetRootPackageJson(host);


    let rule: Rule;

    if (project) {
      if (feature) {
        rule = forFeature(host, project, feature, globalOptions, filter);
      } else {
        rule = forProject(host, project, globalOptions, filter);
      }
    } else {
      rule = forWorkspace(host, globalOptions, filter, directory);
    }

    return chain([
      rule,
      AddPackageJsonDevDependencyRule('@rxap/schematic-composer', 'latest', { soft: true }),
      (tree, context) => {
        const newRootPackageJson = GetRootPackageJson(tree);
        if (!equals(rootPackageJson.dependencies, newRootPackageJson.dependencies) || !equals(rootPackageJson.devDependencies, newRootPackageJson.devDependencies)) {
          context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
        } else {
          console.log('No package.json changes detected. Skip package installation'.green);
        }
      },
    ]);
  };
}
