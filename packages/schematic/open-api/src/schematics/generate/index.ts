import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { ApplyTsMorphProjectRule } from '@rxap/schematics-ts-morph';
import {
  dasherize,
  GetProjectSourceRoot,
} from '@rxap/schematics-utilities';
import { OpenAPIV3 } from 'openapi-types';
import { join } from 'path';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';
import { ClearOperation } from '../../lib/clear-operation';
import {
  COMPONENTS_BASE_PATH,
  PARAMETER_BASE_PATH,
  REQUEST_BODY_BASE_PATH,
  RESPONSE_BASE_PATH,
} from '../../lib/config';
import { GenerateOperation } from '../../lib/generate-operation';
import { LoadOpenApiConfig } from '../../lib/load-open-api-config';
import { GeneratorFunction } from '../../lib/types';
import {
  COMMAND_BASE_PATH,
  DATA_SOURCE_BASE_PATH,
  REMOTE_METHOD_BASE_PATH,
} from './const';
import { GenerateDataSource } from './generate-data-source';
import { GenerateOperationCommand } from './generate-operation-command';
import { GenerateRemoteMethod } from './generate-remote-method';
import { OpenApiSchema } from './schema';

function resolveRef(openApiSpec: OpenAPIV3.Document, node: any, parent?: any, key?: string) {
  if (typeof node !== 'object' || node === null) {
    return;
  }
  if (node['$ref']) {
    if (node.$ref.startsWith('#/components/schemas')) {
      const name = node.$ref.replace('#/components/schemas/', '');
      if (parent && key && openApiSpec.components?.schemas) {
        parent[key] = openApiSpec.components.schemas[name];
      }
    }
  } else {
    for (const [ k, v ] of Object.entries(node)) {
      resolveRef(openApiSpec, v, node, k);
    }
  }
}

export default function (options: OpenApiSchema): Rule {
  return async (host: Tree) => {
    console.log('loading openapi config');
    const openapi = await LoadOpenApiConfig(host, options);
    console.log('resolve all schema refs');
    resolveRef(openapi, openapi.paths);

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
      useInMemoryFileSystem: true,
    });

    if (!options.project) {
      options.project = 'open-api';
    }

    if (options.directory) {
      options.directory = options.directory.split('/').map(item => dasherize(item)).join('/');
    }

    const projectName = options.project;

    const projectSourceRoot = GetProjectSourceRoot(host, projectName);
    const basePath = join(projectSourceRoot, 'lib');

    // if (!options.debug) {
    //   // TODO : reset the hack after the schematic execution is finished
    //   // eslint-disable-next-line @typescript-eslint/no-empty-function
    //   console.debug = function () {};
    // }

    const generatorFunctionList: GeneratorFunction<OpenApiSchema>[] = [];
    const clearPathList: string[] = [];

    if (!options.skipRemoteMethod) {
      generatorFunctionList.push(GenerateRemoteMethod);
      clearPathList.push(REMOTE_METHOD_BASE_PATH);
    }

    if (!options.skipDataSource) {
      generatorFunctionList.push(GenerateDataSource);
      clearPathList.push(DATA_SOURCE_BASE_PATH);
    }

    if (!options.skipCommand) {
      generatorFunctionList.push(GenerateOperationCommand);
      clearPathList.push(COMMAND_BASE_PATH);
    }

    let start = Date.now();

    return chain([
      () => {
        console.log(`+${ Date.now() - start }ms`);
        console.log(`remove old files`);
        start = Date.now();
      },
      ClearOperation([
        COMPONENTS_BASE_PATH,
        PARAMETER_BASE_PATH,
        RESPONSE_BASE_PATH,
        REQUEST_BODY_BASE_PATH,
        ...clearPathList,
      ], basePath),
      () => {
        console.log(`+${ Date.now() - start }ms`);
        console.log(`generate code for operations`);
        start = Date.now();
      },
      () => GenerateOperation(openapi, project, options, generatorFunctionList),
      () => {
        console.log(`+${ Date.now() - start }ms`);
        console.log('apply changed to tree');
        start = Date.now();
      },
      ApplyTsMorphProjectRule(project, basePath, true, true),
      () => {
        console.log(`+${ Date.now() - start }ms`);
        console.log('DONE');
      },
    ]);
  };
}
