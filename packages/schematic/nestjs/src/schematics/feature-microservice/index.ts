import { FeatureMicroserviceOptions } from './schema';
import { chain } from '@angular-devkit/schematics';
import {
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { CoerceNestController } from '@rxap/schematics-ts-morph';
import { CleanUp } from '../init';

export interface NormalizedFeatureMicroserviceOptions extends Readonly<Normalized<FeatureMicroserviceOptions>> {
  directory: string;
  apiPrefix: string;
  imageSuffix: string;
  projectName: string;
  name: string;
}

export function NormalizeFeatureMicroserviceOptions(options: Readonly<FeatureMicroserviceOptions>): NormalizedFeatureMicroserviceOptions {

  const feature = dasherize(options.feature);
  const directory = options.directory ?? [ 'service', 'feature' ].join('/');
  const prefix = directory.split('/').filter(Boolean).map(dasherize).join('-');
  const name = feature;

  return Object.seal({
    name,
    dsn: options.dsn ?? null,
    directory,
    imageRegistry: options.imageRegistry ?? null,
    imageName: options.imageName ?? null,
    imageSuffix: options.imageSuffix ?? `/${ [ 'service', 'feature', feature ].join('/') }`,
    apiPrefix: options.apiPrefix ?? [ 'api', 'feature', feature ].join('/'),
    randomPort: options.randomPort ?? true,
    port: options.port ?? null,
    apiConfigurationFile: options.apiConfigurationFile ?? null,
    feature,
    projectName: [ prefix, name ].join('-'),
    overwrite: options.overwrite ?? false,
    openApi: options.openApi ?? false,
    jwt: options.jwt ?? false,
  });
}

export default function (options: FeatureMicroserviceOptions) {
  const normalizedOptions = NormalizeFeatureMicroserviceOptions(options);
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
    randomPort,
    overwrite,
    openApi,
    jwt,
  } = normalizedOptions;
  console.log(`Generate feature microservice '${ options.feature }' ...`);
  return function () {
    return chain([
      () => console.log(`Execute microservice schematic for '${ name }' ...`),
      ExecuteSchematic('microservice', {
        name,
        dsn,
        directory,
        imageRegistry,
        imageName,
        imageSuffix,
        apiPrefix,
        port,
        randomPort,
        apiConfigurationFile,
        overwrite,
        openApi,
        jwt,
      }),
      () => console.log(`Coerce nest module and controller '${ name }' ...`),
      CoerceNestController({
        name: options.feature,
        project: projectName,
      }),
      CleanUp({ project: projectName }),
    ]);
  };
}
