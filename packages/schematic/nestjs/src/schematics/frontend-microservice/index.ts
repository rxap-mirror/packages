import { chain } from '@angular-devkit/schematics';
import {
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { FrontendMicroserviceOptions } from './schema';
import { CleanUp } from '../init';

export interface NormalizedFrontendMicroserviceOptions extends Readonly<Normalized<FrontendMicroserviceOptions>> {
  directory: string;
  apiPrefix: string;
  imageSuffix: string;
  projectName: string;
  name: string;
}

export function NormalizeFrontendMicroserviceOptions(options: Readonly<FrontendMicroserviceOptions>): NormalizedFrontendMicroserviceOptions {

  const frontend = dasherize(options.frontend);
  const feature = dasherize(options.feature);
  const directory = options.directory ?? [ 'service', 'app', frontend ].join('/');
  const prefix = directory.split('/').filter(Boolean).map(dasherize).join('-');
  const name = feature;

  return Object.seal({
    name,
    dsn: options.dsn ?? null,
    directory,
    imageRegistry: options.imageRegistry ?? null,
    imageName: options.imageName ?? null,
    imageSuffix: options.imageSuffix ?? `/${ [ 'service', 'app', frontend, feature ].join('/') }`,
    apiPrefix: options.apiPrefix ?? [ 'api', 'app', frontend, feature ].join('/'),
    randomPort: options.randomPort ?? true,
    port: options.port ?? null,
    apiConfigurationFile: options.apiConfigurationFile ?? null,
    feature,
    frontend,
    projectName: [ prefix, name ].join('-'),
    overwrite: options.overwrite ?? false,
    openApi: options.openApi ?? false,
    jwt: options.jwt ?? false,
  });
}

export default function (options: FrontendMicroserviceOptions) {
  const normalizedOptions = NormalizeFrontendMicroserviceOptions(options);
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
  console.log(
    `Generate frontend microservice '${ options.frontend }' for feature '${ options.feature }' ...`,
  );
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
      CleanUp({ project: projectName }),
    ]);
  };
}
