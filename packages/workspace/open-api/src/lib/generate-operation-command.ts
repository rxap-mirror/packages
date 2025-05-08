import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  TypeParameterDeclarationStructure,
  Writers,
} from 'ts-morph';
import {
  COMMAND_BASE_PATH,
  COMMAND_FILE_SUFFIX,
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
import { hasResponseAdditionalProperties } from './utilities/has-response-additional-properties';

/**
 *
 *
 * Asynchronously generates a TypeScript source file for an operation command based on the provided OpenAPI schema.
 * The function constructs the file name and path from the operation ID, imports necessary modules and types,
 * and creates a new class that extends `OpenApiOperationCommand` with appropriate decorators and methods.
 *
 * @param parameter - An object containing the operation ID, project reference, and additional options necessary
 * for generating the operation command. The `GenerateParameter` type is expected to be a generic
 * type that includes `OpenApiSchemaBase`.
 * @returns A promise that resolves when the file has been created and all modifications are applied.
 *
 * The function performs the following steps:
 * 1. Constructs the file name from the operation ID and predefined suffixes.
 * 2. Creates a new TypeScript source file in the specified command base path.
 * 3. Dynamically imports necessary decorators and types based on the operation's response type, parameter type,
 * and request body type.
 * 4. Defines a new class with the `Injectable` and `OperationCommand` decorators.
 * - `Injectable` marks the class as a candidate for dependency injection.
 * - `OperationCommand` configures the operation-specific metadata like server ID and operation ID.
 * 5. Adds an `execute` method to the class, which overrides the base class method and handles the operation execution.
 * 6. The class is structured to handle different scenarios based on whether the operation has parameters, a request body,
 * or neither.
 *
 * Note: This function assumes the presence of certain global constants and functions like `COMMAND_FILE_SUFFIX`,
 * `COMMAND_BASE_PATH`, `dasherize`, `GetResponseType`, `GetParameterType`, `GetRequestBodyType`, and
 * `GenerateParameterToOperationObjectWithMetadata`, which are used to configure and structure the generated command class.
 *
 */
export async function GenerateOperationCommand(
  parameter: GenerateParameter<OpenApiSchemaBase>,
): Promise<void> {
  const operationId = parameter.operationId;

  const name = [ operationId, COMMAND_FILE_SUFFIX ].join('.');

  const fileName = join(COMMAND_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [
        { name: 'OpenApiOperationCommand' },
        { name: 'OperationCommand' },
      ],
    },
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

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
      moduleSpecifier: parameter.options.packageName ?? `../responses/${ dasherize(
        responseName.replace(/Response$/, ''),
      ) }.response`,
      namedImports: [ { name: responseName } ],
    });
  }

  if (![ 'void', 'any' ].includes(parameterType)) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ?? `../parameters/${ dasherize(
        parameterType.replace(/Parameter$/, ''),
      ) }.parameter`,
      namedImports: [ { name: parameterType } ],
    });
  }

  if (requestBodyName) {
    importStructures.push({
      moduleSpecifier: parameter.options.packageName ?? `../request-bodies/${ dasherize(
        requestBodyName.replace(/RequestBody$/, ''),
      ) }.request-body`,
      namedImports: [ { name: requestBodyName } ],
    });
  }

  const callMethodParameters: OptionalKind<ParameterDeclarationStructure>[] =
    [];

  const withoutParametersAndRequestBody =
    parameterType === 'void' && requestBodyType === 'void';

  if (!withoutParametersAndRequestBody) {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiOperationCommandParameters<${ parameterType }, ${ requestBodyType }>`,
    });
    importStructures.push({
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [ { name: 'OpenApiOperationCommandParameters' } ],
    });
  } else {
    callMethodParameters.push({
      name: 'parameters',
      type: `OpenApiOperationCommandWithoutParameters`,
      initializer: '{}',
    });
    importStructures.push({
      moduleSpecifier: '@rxap/nest-open-api',
      namedImports: [ { name: 'OpenApiOperationCommandWithoutParameters' } ],
    });
  }

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name: classify(name.replace(/\./g, '-')),
    typeParameters: GetTypeParameters(parameter),
    decorators: [
      {
        name: 'Injectable',
        arguments: [],
      },
      {
        name: 'OperationCommand',
        arguments: (writer) =>
          Writers.object({
            serverId: (w) => w.quote(parameter.options.serverId!),
            operationId: (w) => w.quote(parameter.operationId),
            operation: (w) =>
              w.quote(
                JSON.stringify(
                  GenerateParameterToOperationObjectWithMetadata(parameter),
                ).replace(/[\n\r\\]+/g, ''),
              ),
          })(writer),
      },
    ],
    methods: [
      {
        name: 'execute',
        parameters: callMethodParameters,
        scope: Scope.Public,
        returnType: `Promise<${ responseType }>`,
        hasOverrideKeyword: true,
        statements: [ `return super.execute(parameters);` ],
      },
    ],
    extends: (writer) => {
      writer.write('OpenApiOperationCommand');
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
}
