import {
  GenerateParameter,
  GetResponseType,
  GetParameterType,
  GetRequestBodyType,
  IsWithoutParameters,
  IsCollectionResponse,
  GenerateParameterToOperationObjectWithMetadata
} from '@rxap/schematics-open-api';
import { OpenApiSchemaBase } from './schema';
import { join } from 'path';
import {
  OptionalKind,
  ImportDeclarationStructure,
  ParameterDeclarationStructure,
  ClassDeclarationStructure,
  Writers,
  Scope
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { CreateDirective } from './create-directive';
import {
  REMOTE_METHOD_FILE_SUFFIX,
  REMOTE_METHOD_BASE_PATH
} from './const';

const { dasherize, classify } = strings;

export async function GenerateRemoteMethod(
  parameter: GenerateParameter<OpenApiSchemaBase>
): Promise<void> {
  const operationId = parameter.operationId;

  const name     = [ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('.');
  const fileName = join(REMOTE_METHOD_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/remote-method',
      namedImports:    [
        { name: 'RxapOpenApiRemoteMethod' },
        { name: 'OpenApiRemoteMethodParameter' }
      ]
    },
    {
      moduleSpecifier: '@angular/core',
      namedImports:    [ { name: 'Injectable' } ]
    }
  ];

  switch (parameter.options.transport) {
    case 'amplify':
      importStructures.push({
        moduleSpecifier: '@rxap/amplify-open-api',
        namedImports:    [ { name: 'AmplifyOpenApiRemoteMethod' } ]
      });
      break;

    default:
      importStructures.push({
        moduleSpecifier: '@rxap/open-api/remote-method',
        namedImports:    [ { name: 'OpenApiRemoteMethod' } ]
      });
      break;
  }

  const responseType: string    = GetResponseType(parameter);
  const parameterType: string   = GetParameterType(parameter);
  const requestBodyType: string = GetRequestBodyType(parameter);

  if (!['void', 'any'].includes(responseType)) {
    importStructures.push({
      moduleSpecifier: `../responses/${dasherize(responseType.replace(/Response$/, ''))}.response`,
      namedImports:    [ { name: responseType } ]
    })
  }

  if (!['void', 'any'].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: `../parameters/${dasherize(parameterType.replace(/Parameter$/, ''))}.parameter`,
      namedImports:    [ { name: parameterType } ]
    })
  }

  if (!['void', 'any'].includes(requestBodyType)) {
    importStructures.push({
      moduleSpecifier: `../request-bodies/${dasherize(requestBodyType.replace(/RequestBody$/, ''))}.request-body`,
      namedImports:    [ { name: requestBodyType } ]
    })
  }

  const callMethodParameters: OptionalKind<ParameterDeclarationStructure>[] =
          [];

  const withoutParametersAndRequestBody =
          parameterType === 'void' && requestBodyType === 'void';

  if (!withoutParametersAndRequestBody) {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiRemoteMethodParameter<${parameterType}, ${requestBodyType}>`
    });
  }

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name:       classify(name.replace(/\./g, '-')),
    decorators: [
      {
        name:      'Injectable',
        arguments: Writers.object({
          providedIn: (writer) => writer.quote('root')
        })
      },
      {
        name:      'RxapOpenApiRemoteMethod',
        arguments: parameter.options.inline ? (writer) => Writers.object({
          serverId: parameter.options.serverId ? w => w.quote(parameter.options.serverId!) : 'undefined',
          operation: `JSON.parse(\`${JSON.stringify(GenerateParameterToOperationObjectWithMetadata(parameter)).replace('\n', '')}\`) as any`
        })(writer) : w => w.quote(operationId)
      }
    ],
    methods:    [
      {
        name:       'call',
        parameters: callMethodParameters,
        scope:      Scope.Public,
        returnType: `Promise<${responseType}>`,
        statements: [
          `return super.call(${
            withoutParametersAndRequestBody ? '' : 'parameters'
          });`
        ]
      }
    ],
    extends:    (writer) => {
      switch (parameter.options.transport) {
        case 'amplify':
          writer.write('AmplifyOpenApiRemoteMethod');
          break;

        default:
          writer.write('OpenApiRemoteMethod');
          break;
      }
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write(', ');
      writer.write(requestBodyType);
      writer.write('>');
    },
    isExported: true
  };

  sourceFile.addClass(classStructure);

  const withoutParameters = IsWithoutParameters(parameter);

  if (IsCollectionResponse(parameter)) {
    importStructures.push({
      moduleSpecifier: '@rxap/utilities',
      namedImports:    [ { name: 'ArrayElement' } ]
    });
    CreateDirective({
      filePath:       fileName,
      name:           operationId,
      prefix:         parameter.options.prefix,
      parametersType: `OpenApiRemoteMethodParameter<${parameterType}, ${requestBodyType}>`,
      returnType:     `ArrayElement<${responseType}>`,
      template:       true,
      collection:     true,
      sourceFile,
      withoutParameters
    });
  }

  sourceFile.addImportDeclarations(importStructures);

  CreateDirective({
    filePath:       fileName,
    name:           operationId,
    prefix:         parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${parameterType}, ${requestBodyType}>`,
    returnType:     responseType,
    template:       true,
    collection:     false,
    sourceFile,
    withoutParameters
  });

  CreateDirective({
    filePath:       fileName,
    name:           operationId,
    prefix:         parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${parameterType}, ${requestBodyType}>`,
    returnType:     responseType,
    template:       false,
    collection:     false,
    sourceFile,
    withoutParameters
  });

  sourceFile.organizeImports({
    ensureNewLineAtEndOfFile: true
  });
}
