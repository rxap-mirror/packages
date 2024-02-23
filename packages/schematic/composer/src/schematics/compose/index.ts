import {
  chain,
  externalSchematic,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { HasProjectFeature } from '@rxap/schematics-ts-morph';
import {
  GetProjectSourceRoot,
  GlobalOptions,
} from '@rxap/schematics-utilities';
import {
  coerceArray,
  dasherize,
  Normalized,
} from '@rxap/utilities';
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

function detectedFeature(path: string): string | undefined {
  const fragments = path.split('/').reverse();
  let last = fragments.pop();
  for (const fragment of fragments) {
    if (fragment === 'feature') {
      return last;
    }
    last = fragment;
  }
  return undefined;
}

function parseSchematicCommandFile(host: Tree, filePath: string): SchematicCommand[] {

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
  projectSourceRoot: string,
) {

  const schematicCommandList: SchematicCommand[] = parseSchematicCommandFile(host, schematicCommandFilePath);

  const ruleList: Rule[] = [];

  for (const command of schematicCommandList) {
    const options: { feature?: string, directory?: string, project?: string } & Record<string, any> = {
      ...globalOptions,
      ...command.options,
    };
    options.feature ??= detectedFeature(schematicCommandFilePath);
    const directoryParts = relative(projectSourceRoot, dirname(schematicCommandFilePath).replace(/^\//, '')).split('/');
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
    ruleList.push(chain([
      () => console.log(`Execute schematic '${ command.package }:${ command.name }'`.green),
      () => console.log(`Input Options: ${ JSON.stringify(options) }`.grey),
      () => {
        try {
          return externalSchematic(command.package, command.name, options);
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

  host.getDir(sourceRoot).visit((path, entry) => {
    if (entry?.path.endsWith('schematic.json')) {
      schematicCommandList.push(path);
    }
    if (entry?.path.endsWith('schematic.yaml')) {
      schematicCommandList.push(path);
    }
    if (entry?.path.endsWith('schematic.yml')) {
      schematicCommandList.push(path);
    }
    if (entry?.path.endsWith('schematics.json')) {
      schematicCommandList.push(path);
    }
    if (entry?.path.endsWith('schematics.yaml')) {
      schematicCommandList.push(path);
    }
    if (entry?.path.endsWith('schematics.yml')) {
      schematicCommandList.push(path);
    }
  });

  return schematicCommandList;
}

function getSchematicCommandRuleList(
  host: Tree,
  schematicCommandList: string[],
  globalOptions: Partial<GlobalOptions>,
  projectSourceRoot: string,
) {
  const ruleList: Rule[] = [];

  for (const schematicCommandFilePath of schematicCommandList) {
    ruleList.push(chain([
      () => console.log(`Execute schematic command file '${ schematicCommandFilePath }'`.blue),
      executeSchematicCommandFile(host, schematicCommandFilePath, globalOptions, projectSourceRoot),
    ]));
  }

  return chain(ruleList);
}

function executeSchematicCommand(
  host: Tree,
  sourceRoot: string,
  globalOptions: Partial<GlobalOptions>,
  filter: string | null,
  projectSourceRoot: string,
) {
  let schematicCommandList = getSchematicCommandList(host, sourceRoot);

  if (filter) {
    schematicCommandList = schematicCommandList.filter(path => dirname(path).split('/').pop() === filter);
  }

  return getSchematicCommandRuleList(host, schematicCommandList, globalOptions, projectSourceRoot);
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

  return executeSchematicCommand(host, featureSourceRoot, globalOptions, filter, projectSourceRoot);

}

function forProject(host: Tree, projectName: string, globalOptions: Partial<GlobalOptions>, filter: string | null) {

  const projectSourceRoot = GetProjectSourceRoot(host, projectName);

  console.log('Use project source root:', projectSourceRoot);

  return executeSchematicCommand(host, projectSourceRoot, globalOptions, filter, projectSourceRoot);

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
  } = normalizedOptions;

  const globalOptions: Partial<GlobalOptions> = {
    // TODO : fix Normalized type support overwrite?: string[] | boolean;
    overwrite: overwrite as any,
    replace: replace,
    project: project ?? undefined,
    feature: feature ?? undefined,
  };

  return (host: Tree) => {

    if (project) {
      if (feature) {
        return forFeature(host, project, feature, globalOptions, filter);
      }
      return forProject(host, project, globalOptions, filter);
    }

    throw new Error('Not yet implemented - project and feature options are required!');
  };
}
