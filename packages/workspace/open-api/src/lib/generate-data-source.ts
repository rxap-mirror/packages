import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  TypeParameterDeclarationStructure,
  Writers,
} from 'ts-morph';
import {
  DATA_SOURCE_BASE_PATH,
  DATA_SOURCE_FILE_SUFFIX,
} from './const';
import { GenerateParameter } from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetResponseType } from './utilities/get-response-type';
import { GetTypeParameters } from './utilities/get-type-parameters';
import { hasResponseAdditionalProperties } from './utilities/has-response-additional-properties';

/**
 * Generates a TypeScript source file for an OpenAPI data source class based on the provided parameters.
 * This function only processes GET methods and creates a new source file in a specified base path with necessary imports and a class definition.
 *
 * @param {GenerateParameter} parameter - The parameters required to generate the data source, including:
 * - `method`: The HTTP method (only 'GET' is processed).
 * - `operationId`: The unique identifier for the operation.
 * - `project`: The project within which the source file will be created.
 * - `options`: Additional options such as package name for custom imports.
 *
 * The function performs the following steps:
 * 1. Validates if the HTTP method is 'GET'. If not, the function returns immediately.
 * 2. Constructs the file name using the operation ID and predefined suffixes and paths.
 * 3. Creates a new TypeScript source file in the specified project directory.
 * 4. Determines the response and parameter types for the data source and adds necessary imports.
 * 5. Defines a class that extends `OpenApiDataSource` with decorators for dependency injection and OpenAPI integration.
 * 6. Writes the newly defined class and imports to the source file.
 *
 * Note: The function assumes the presence of utility functions like `dasherize` and `classify` for naming conventions,
 * and constants like `DATA_SOURCE_FILE_SUFFIX` and `DATA_SOURCE_BASE_PATH` for file naming and location.
 */
export function GenerateDataSource(
  parameter: GenerateParameter,
): void {
  if (parameter.method.toUpperCase() !== 'GET') {
    return;
  }

  const operationId = parameter.operationId;

  const name = [ operationId, DATA_SOURCE_FILE_SUFFIX ].join('.');
  const fileName = join(DATA_SOURCE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      moduleSpecifier: '@rxap/open-api/data-source',
      namedImports: [
        { name: 'RxapOpenApiDataSource' },
        { name: 'OpenApiDataSource' },
      ],
    },
    {
      moduleSpecifier: '@angular/core',
      namedImports: [ { name: 'Injectable' } ],
    },
  ];

  const {
    type: responseType,
    name: responseName,
  } = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);

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

  const classStructure: OptionalKind<ClassDeclarationStructure> = {
    name: classify(name.replace(/\./g, '-')),
    typeParameters: GetTypeParameters(parameter),
    decorators: [
      {
        name: 'Injectable',
        arguments: Writers.object({
          providedIn: (writer) => writer.quote('root'),
        }),
      },
      {
        name: 'RxapOpenApiDataSource',
        arguments: (writer) => writer.quote(operationId),
      },
    ],
    extends: (writer) => {
      writer.write('OpenApiDataSource');
      writer.write('<');
      writer.write(responseType);
      writer.write(', ');
      writer.write(parameterType);
      writer.write('>');
    },
    isExported: true,
  };

  sourceFile.addImportDeclarations(importStructures);
  sourceFile.addClass(classStructure);
}
