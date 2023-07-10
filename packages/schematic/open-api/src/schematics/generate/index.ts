import {
  chain,
  noop,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { join } from 'path';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';
import {
  ApplyTsMorphProject,
  FixMissingImports,
} from '@rxap/schematics-ts-morph';
import { OpenApiSchema } from './schema';
import {
  CoerceFile,
  dasherize,
  GetDefaultPrefix,
  GetProjectPrefix,
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/schematics-utilities';
import { GenerateRemoteMethod } from './generate-remote-method';
import { REMOTE_METHOD_BASE_PATH } from './const';
import { CoerceOpenApiProject } from './coerce-open-api-project';
import { GenerateOpenapiProvider } from './generate-openapi-provider';
import { OpenAPIV3 } from 'openapi-types';
import {
  IgnoreOperation,
  IsHttpMethod,
  IsOperationObject,
} from '../../lib/utilities';
import { LoadOpenApiConfig } from '../../lib/load-open-api-config';
import {
  GeneratorFunction,
  HasOperationId,
} from '../../lib/types';
import {
  COMPONENTS_BASE_PATH,
  PARAMETER_BASE_PATH,
  REQUEST_BODY_BASE_PATH,
  RESPONSE_BASE_PATH,
} from '../../lib/config';
import { ClearOperation } from '../../lib/clear-operation';
import { GenerateIndexExports } from '../../lib/generate-index-exports';
import { GenerateOperation } from '../../lib/generate-operation';

function GetOperationIdList(openapi: OpenAPIV3.Document): string[] {

  const operationIdList: string[] = [];

  for (const [ _, methods ] of Object.entries(openapi.paths)) {

    if (methods) {

      for (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[method];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation([ 'hidden' ])(operation)) {

            console.log(`Ignore operation '${ operation.operationId }'`);

          } else {

            if (HasOperationId(operation)) {
              operationIdList.push(operation.operationId);
            }

          }
        }

      }

    }

  }

  return operationIdList;

}

export default function (options: OpenApiSchema): Rule {
  return async (host: Tree) => {
    const openapi = await LoadOpenApiConfig(host, options);

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces, quoteKind: QuoteKind.Single, useTrailingCommas: true,
      }, useInMemoryFileSystem: true,
    });

    if (!options.project) {
      options.project = 'open-api';
    }

    if (options.directory) {
      options.directory = options.directory.split('/').map(item => dasherize(item)).join('/');
    }

    const projectName = `${ options.directory ?
                            options.directory.split('/').join('-') + '-' :
                            '' }${ options.project }`;

    const projectBasePath = HasProject(host, projectName) ?
                            GetProjectSourceRoot(host, projectName) :
                            `libs/${ options.directory ? options.directory + '/' : '' }${ options.project }/src`;
    const basePath = join(projectBasePath, 'lib');

    options.prefix = options.prefix ??
                     (
                       HasProject(host, projectName) ? GetProjectPrefix(host, projectName) : GetDefaultPrefix(host)
                     ) ??
                     'rxap';

    if (!options.debug) {
      // TODO : reset the hack after the schematic execution is finished
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      console.debug = function () {};
    }

    const generatorFunctionList: GeneratorFunction<OpenApiSchema>[] = [];
    const clearPathList: string[] = [];

    if (!options.skipRemoteMethod) {
      generatorFunctionList.push(GenerateRemoteMethod);
      clearPathList.push(REMOTE_METHOD_BASE_PATH);
    }

    return chain([
      ClearOperation([
        COMPONENTS_BASE_PATH, PARAMETER_BASE_PATH, RESPONSE_BASE_PATH, REQUEST_BODY_BASE_PATH, ...clearPathList,
      ], basePath),
      CoerceOpenApiProject(options.project, options.prefix, options.directory),
      async () => { await GenerateOperation(openapi, project, options, generatorFunctionList); },
      () => options.skipProvider ? noop() : GenerateOpenapiProvider(project, GetOperationIdList(openapi), options),
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
