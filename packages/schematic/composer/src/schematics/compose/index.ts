import {
  chain,
  externalSchematic,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { ComposeSchematicSchema } from './schema';
import {
  GetProjectSourceRoot,
  GlobalOptions,
} from '@rxap/schematics-utilities';
import { dasherize } from '@rxap/utilities';
import {
  dirname,
  join,
} from 'path';
import { HasProjectFeature } from '@rxap/schematics-ts-morph';

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

function executeSchematicCommandFile(
  host: Tree,
  schematicCommandFilePath: string,
  globalOptions: Partial<GlobalOptions>,
) {

  const schematicCommandFile = host.read(schematicCommandFilePath)?.toString('utf-8');

  if (!schematicCommandFile) {
    throw new SchematicsException(`The schematic command file '${ schematicCommandFilePath }' does not exists!`);
  }

  const schematicCommandList: SchematicCommand[] = JSON.parse(schematicCommandFile);

  const ruleList: Rule[] = [];

  for (const command of schematicCommandList) {
    const options = {
      ...globalOptions,
      ...command.options,
    };
    options.feature ??= detectedFeature(schematicCommandFilePath);
    ruleList.push(chain([
      () => console.log(`Execute schematic '${ command.package }:${ command.name }'`),
      () => console.log('Options:', JSON.stringify(options)),
      () => {
        try {
          return externalSchematic(command.package, command.name, options);
        } catch (e) {
          console.error(`Error while executing schematic '${ command.package }:${ command.name }'`);
          console.log('Retry with this schematic with the command:');
          console.log(`nx g @rxap/schematic-composer:compose --project ${ options.project } --feature ${ options.feature } --filter ${ dirname(
            schematicCommandFilePath).split('/').pop() }`);
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
  });

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
      () => console.log(`Execute schematic command file '${ schematicCommandFilePath }'`),
      executeSchematicCommandFile(host, schematicCommandFilePath, globalOptions),
    ]));
  }

  return chain(ruleList);
}

function executeSchematicCommand(
  host: Tree,
  sourceRoot: string,
  globalOptions: Partial<GlobalOptions>,
  filter?: string,
) {
  let schematicCommandList = getSchematicCommandList(host, sourceRoot);

  if (filter) {
    schematicCommandList = schematicCommandList.filter(path => dirname(path).split('/').pop() === filter);
  }

  return getSchematicCommandRuleList(host, schematicCommandList, globalOptions);
}

function forFeature(
  host: Tree,
  projectName: string,
  featureName: string,
  globalOptions: Partial<GlobalOptions>,
  filter?: string,
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

function forProject(host: Tree, projectName: string, globalOptions: Partial<GlobalOptions>, filter?: string) {

  const projectSourceRoot = GetProjectSourceRoot(host, projectName);

  console.log('Use project source root:', projectSourceRoot);

  return executeSchematicCommand(host, projectSourceRoot, globalOptions, filter);

}

function NormalizeComposeOptions(options: ComposeSchematicSchema): ComposeSchematicSchema {
  return Object.seal({
    project: options.project ? dasherize(options.project) : undefined,
    feature: options.feature ? dasherize(options.feature) : undefined,
    filter: options.filter ?? undefined,
  });
}

export default function (options: ComposeSchematicSchema) {
  const normalizedOptions = NormalizeComposeOptions(options);
  const {
    project,
    feature,
    filter,
  } = normalizedOptions;

  const globalOptions: Partial<GlobalOptions> = {
    overwrite: options.overwrite,
    replace: options.replace,
    project: project,
    feature: feature,
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
