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
import { GetTypeParameters } from './utilities/get-type-parameters';

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

  const {
    type: responseType,
    name: responseName,
  } = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);
  const {
    type: requestBodyType,
    name: requestBodyName,
  } = GetRequestBodyType(parameter);

  if (responseName) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../responses/${ dasherize(responseName.replace(/Response$/, '')) }.response`,
      namedImports: [ { name: responseName } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../parameters/${ dasherize(parameterType.replace(/Parameter$/, '')) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (requestBodyName) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ??
        `../request-bodies/${ dasherize(requestBodyName.replace(/RequestBody$/, '')) }.request-body`,
      namedImports: [ { name: requestBodyName } ],
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
    typeParameters: GetTypeParameters(parameter),
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
          operation: w => {
            w.write('`');
            console.log(JSON.stringify(GenerateParameterToOperationObjectWithMetadata(parameter), undefined, 2));
            w.write(JSON.stringify(GenerateParameterToOperationObjectWithMetadata(parameter), undefined, 2));
            w.write('`');
          },
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
