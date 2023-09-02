import { strings } from '@angular-devkit/core';
import { join } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  Writers,
} from 'ts-morph';
import {
  REMOTE_METHOD_BASE_PATH,
  REMOTE_METHOD_FILE_SUFFIX,
} from './const';
import {
  GenerateParameter,
  GenerateParameterToOperationObjectWithMetadata,
  OpenApiSchemaBase,
} from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetRequestBodyType } from './utilities/get-request-body-type';
import { GetResponseType } from './utilities/get-response-type';

const {
  dasherize,
  classify,
} = strings;

export function GenerateRemoteMethod(parameter: GenerateParameter<OpenApiSchemaBase>): void {
  const operationId = parameter.operationId;

  const name = [ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('.');
  const fileName = join(REMOTE_METHOD_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/remote-method',
      namedImports: [
        { name: 'RxapOpenApiRemoteMethod' }, { name: 'OpenApiRemoteMethodParameter' },
      ],
    }, {
      moduleSpecifier: '@angular/core',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

  importStructures.push({
    moduleSpecifier: '@rxap/open-api/remote-method',
    namedImports: [ { name: 'OpenApiRemoteMethod' } ],
  });

  const responseType: string = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const requestBodyType: string = GetRequestBodyType(parameter);

  if (![ 'void', 'any' ].includes(responseType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../responses/${ dasherize(responseType.replace(/Response$/, '')) }.response`,
      namedImports: [ { name: responseType } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../parameters/${ dasherize(parameterType.replace(/Parameter$/, '')) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (![ 'void', 'any' ].includes(requestBodyType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../request-bodies/${ dasherize(requestBodyType.replace(/RequestBody$/, '')) }.request-body`,
      namedImports: [ { name: requestBodyType } ],
    });
  }

  const callMethodParameters: OptionalKind<ParameterDeclarationStructure>[] = [];

  const withoutParametersAndRequestBody = parameterType === 'void' && requestBodyType === 'void';

  if (!withoutParametersAndRequestBody) {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
    });
  }

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name: classify(name.replace(/\./g, '-')),
    decorators: [
      {
        name: 'Injectable',
        arguments: Writers.object({
          providedIn: (writer) => writer.quote('root'),
        }),
      }, {
        name: 'RxapOpenApiRemoteMethod',
        arguments: (writer) => Writers.object({
          serverId: parameter.options.serverId ? w => w.quote(parameter.options.serverId!) : 'undefined',
          operationId: w => w.quote(parameter.operationId),
          operation: w => w.quote(JSON.stringify(GenerateParameterToOperationObjectWithMetadata(parameter))
                                      .replace(/[\n\r\\]+/g, '')),
        })(writer),
      },
    ],
    methods: [
      {
        name: 'call',
        parameters: callMethodParameters,
        scope: Scope.Public,
        returnType: `Promise<${ responseType }>`,
        hasOverrideKeyword: true,
        statements: [
          `return super.call(${ withoutParametersAndRequestBody ? '' : 'parameters' });`,
        ],
      },
    ],
    extends: (writer) => {
      writer.write('OpenApiRemoteMethod');
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write(', ');
      writer.write(requestBodyType);
      writer.write('>');
    },
    isExported: true,
  };

  sourceFile.addClass(classStructure);

  sourceFile.addImportDeclarations(importStructures);

  sourceFile.organizeImports({
    ensureNewLineAtEndOfFile: true,
  });
}
