import {
  Rule,
  Tree,
  chain
} from '@angular-devkit/schematics';
import { join } from 'path';
import {
  Project,
  IndentationText,
  QuoteKind
} from 'ts-morph';
import {
  FixMissingImports,
  ApplyTsMorphProject
} from '@rxap/schematics-ts-morph';
import {
  GenerateOperation,
  LoadOpenApiConfig,
  ClearOperation,
  PARAMETER_BASE_PATH,
  COMPONENTS_BASE_PATH,
  RESPONSE_BASE_PATH,
  REQUEST_BODY_BASE_PATH,
  GenerateIndexExports
} from '@rxap/schematics-open-api';
import { OpenApiSchema } from './schema';
import {
  GetProjectPrefix,
  CoerceFile,
  HasProject,
  GetDefaultPrefix
} from '@rxap/schematics-utilities';
import { GenerateRemoteMethod } from './generate-remote-method';
import { GenerateDataSource } from './generate-data-source';
import {
  REMOTE_METHOD_BASE_PATH,
  DATA_SOURCE_BASE_PATH
} from './const';
import { CoerceOpenApiProject } from './coerce-open-api-project';

export default function(options: OpenApiSchema): Rule {
  return async (host: Tree) => {
    const openapi = await LoadOpenApiConfig(host, options);

    const project = new Project({
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      },
      useInMemoryFileSystem: true
    });

    if (!options.project) {
      options.project = 'open-api';
    }

    const projectBasePath = join('libs', options.project, 'src');
    const basePath = join(projectBasePath, 'lib');

    options.prefix = options.prefix ?? (HasProject(host, options.project) ? GetProjectPrefix(host, options.project) : GetDefaultPrefix(host)) ?? 'rxap';

    if (!options.debug) {
      // TODO : reset the hack after the schematic execution is finished
      console.debug = function () {};
    }

    return chain([
      ClearOperation(
        [
          COMPONENTS_BASE_PATH,
          PARAMETER_BASE_PATH,
          RESPONSE_BASE_PATH,
          REQUEST_BODY_BASE_PATH,
          DATA_SOURCE_BASE_PATH,
          REMOTE_METHOD_BASE_PATH
        ],
        basePath
      ),
      CoerceOpenApiProject(options.project, options.prefix),
      () =>
        GenerateOperation(openapi, project, options, [
          GenerateDataSource,
          GenerateRemoteMethod
        ]),
      ApplyTsMorphProject(project, basePath),
      FixMissingImports(),
      (tree) => {
        const indexFile = join(projectBasePath, 'index.ts');
        if (options.export) {
          CoerceFile(tree, indexFile, GenerateIndexExports(project));
        } else {
          CoerceFile(tree, indexFile, 'export {};');
        }
      },
    ]);
  };
}
