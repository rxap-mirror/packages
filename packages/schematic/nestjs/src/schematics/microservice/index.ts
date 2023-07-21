import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceNestController } from '@rxap/schematics-ts-morph';
import {
  CoerceFile,
  dasherize,
  ExecuteExternalSchematic,
  ExecuteSchematic,
  UpdateProjectConfigurationRule,
} from '@rxap/schematics-utilities';
import {
  Normalized,
  unique,
} from '@rxap/utilities';
import { CleanUp } from '../init';
import { MicroserviceOptions } from './schema';

export interface NormalizedMicroserviceOptions extends Readonly<Normalized<MicroserviceOptions>> {
  directory: string;
  apiPrefix: string;
  imageSuffix: string;
  projectName: string;
  port: number;
}

function updateApiConfigurationFile({ apiConfigurationFile, projectName, apiPrefix }: NormalizedMicroserviceOptions): Rule {
  if (apiConfigurationFile) {
    return chain([
      () => console.log('Update api configuration file ...'),
      (tree) => {
        const configApi = JSON.parse(CoerceFile(tree, apiConfigurationFile, '{}', false));
        configApi[projectName] = { baseUrl: `/${ apiPrefix }` };
        tree.overwrite(
          apiConfigurationFile,
          JSON.stringify(configApi, undefined, 2),
        );
      },
    ]);
  }
  return noop();
}

export function NormalizeMicroserviceOptions(options: Readonly<MicroserviceOptions>): NormalizedMicroserviceOptions {

  const directory = options.directory ?? 'service';
  const prefix = directory.split('/').filter(Boolean).map(dasherize).join('-');
  const name = dasherize(options.name).replace(new RegExp(`^${ prefix }-`), '');
  const randomPort = options.randomPort ?? true;

  let port = options.port ?? 0;
  if (!port) {
    if (randomPort) {
      port = Math.floor(Math.random() * 1000 + 3000);
    } else {
      port = 3000;
    }
  }

  return Object.seal({
    name,
    dsn: options.dsn ?? null,
    directory,
    imageRegistry: options.imageRegistry ?? null,
    imageName: options.imageName ?? null,
    imageSuffix: options.imageSuffix ?? `/${ [ 'service', name ].join('/') }`,
    apiPrefix: options.apiPrefix ?? [ 'api', name ].join('/'),
    projectName: [ prefix, name ].join('-'),
    randomPort,
    port,
    apiConfigurationFile: options.apiConfigurationFile ?? null,
    overwrite: options.overwrite ?? false,
    openApi: options.openApi ?? false,
    jwt: options.jwt ?? false,
  });
}

export default function (options: MicroserviceOptions) {
  const normalizedOptions = NormalizeMicroserviceOptions(options);
  const {
    name,
    dsn,
    directory,
    imageRegistry,
    imageName,
    imageSuffix,
    apiPrefix,
    projectName,
    port,
    apiConfigurationFile,
    overwrite,
    openApi,
    jwt,
  } = normalizedOptions;
  return function () {

    console.log(`Generate microservice '${ name }' in project '${ projectName }' in directory '${ directory ??
    '<<default>>' }' ...`);

    return chain([
      () => console.log('Generate nest application ...'),
      ExecuteExternalSchematic('@nx/nest', 'application', {
        name,
        directory,
        e2eTestRunner: 'none',
      }),
      () => console.log('Init nest application ...'),
      ExecuteSchematic('init', {
        project: projectName,
        google: false,
        sentry: true,
        swagger: true,
        healthIndicator: true,
        healthIndicatorList: [],
        validator: true,
        platform: 'express',
        pluginDockerOptions: {
          imageRegistry,
          imageName,
          imageSuffix,
          save: true,
        },
        sentryDsn: dsn,
        port,
        apiPrefix,
        overwrite,
        openApi,
        jwt,
      }),
      () => console.log('Add deploy target to project configuration ...'),
      ExecuteExternalSchematic('@nx/workspace', 'run-commands', {
        name: 'deploy',
        project: projectName,
        command: 'echo ok',
      }),
      updateApiConfigurationFile(normalizedOptions),
      () => console.log('Update project configuration ...'),
      UpdateProjectConfigurationRule(project => {
        project.tags ??= [];
        project.tags.push('service');
        project.tags.push('nest');
        project.tags.push('sentry');
        project.tags.push('open-api');
        project.tags = project.tags.filter(unique());
      }, { projectName }),
      () => console.log(`Coerce nest module and controller '${ name }' ...`),
      CoerceNestController({
        name,
        project: projectName,
      }),
      CleanUp({ project: projectName }),
    ]);
  };
}
