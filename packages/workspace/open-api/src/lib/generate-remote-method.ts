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

/**
 *
 *
 * Generates a TypeScript source file for a remote method based on the provided OpenAPI schema.
 * This function constructs a class that extends `OpenApiRemoteMethod` and is decorated with `Injectable` and `RxapOpenApiRemoteMethod`.
 * The generated class includes a `call` method that can be used to execute the remote method.
 *
 * @param parameter - An object containing options and metadata necessary for generating the remote method.
 * The `parameter` object must include:
 * - `operationId`: A unique identifier for the operation.
 * - `project`: A project within which the source file will be created.
 * - `options`: Additional options such as `serverId` and `packageName` for customizing the generated method.
 *
 * The function performs the following steps:
 * 1. Constructs the file name from the `operationId` and predefined suffixes.
 * 2. Creates a new TypeScript source file in the specified project.
 * 3. Dynamically constructs import statements based on the response type, parameter type, and request body type.
 * 4. Defines a class that extends `OpenApiRemoteMethod` with appropriate type parameters and decorators.
 * 5. Adds a `call` method to the class, which overrides the base method to execute the remote operation.
 * 6. Organizes imports and ensures proper formatting of the generated source file.
 *
 * The generated class is decorated with `@Injectable` to facilitate its usage within Angular's dependency injection system,
 * and `@RxapOpenApiRemoteMethod` to configure it with metadata about the remote operation.
 *
 */
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
