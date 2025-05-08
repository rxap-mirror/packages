import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ImportDeclarationStructure,
  OptionalKind,
  TypeParameterDeclarationStructure,
} from 'ts-morph';
import {
  DIRECTIVE_BASE_PATH,
  DIRECTIVE_FILE_SUFFIX,
  REMOTE_METHOD_FILE_SUFFIX,
} from './const';
import { CreateDirective } from './create-directive';
import {
  GenerateParameter,
  OpenApiSchemaBase,
} from './types';
import { GetParameterType } from './utilities/get-parameter-type';
import { GetRequestBodyType } from './utilities/get-request-body-type';
import { GetResponseType } from './utilities/get-response-type';
import { GetTypeParameters } from './utilities/get-type-parameters';
import { hasResponseAdditionalProperties } from './utilities/has-response-additional-properties';
import { IsCollectionResponse } from './utilities/is-collection-response';
import { IsWithoutParameters } from './utilities/is-without-parameters';

/**
 * Generates TypeScript directive files for handling API operations defined in an OpenAPI specification.
 * This function creates one or more directive files based on the provided operation details, handling
 * different scenarios such as response collections and parameter requirements.
 *
 * @param parameter - An object of type `GenerateParameter<OpenApiSchemaBase>` containing all necessary
 * information to generate the directive files. This includes the operation ID, project context, and
 * additional options such as response and parameter types.
 *
 * The function performs the following steps:
 * 1. Constructs the file name from the operation ID and predefined suffixes.
 * 2. Initializes a new source file in the project for the directive.
 * 3. Dynamically constructs import statements based on the operation's requirements, such as response
 * types, parameter types, and request body types.
 * 4. Determines if the operation's response is a collection and adjusts the directive accordingly.
 * 5. Creates one or more directives in the source file to handle the API operation, considering whether
 * the operation requires parameters and if it should be treated as a collection.
 * 6. Organizes and adds all necessary import declarations to the source file.
 * 7. Ensures proper formatting and organization of imports in the created source file.
 *
 * This function is designed to automate the boilerplate creation of TypeScript directives for API operations,
 * facilitating easier and more maintainable API integration within projects using the OpenAPI specification.
 */
export function GenerateDirectives(parameter: GenerateParameter<OpenApiSchemaBase>): void {
  const operationId = parameter.operationId;

  const name = [ operationId, DIRECTIVE_FILE_SUFFIX ].join('.');
  const fileName = join(DIRECTIVE_BASE_PATH, dasherize(name) + '.ts');

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
    {
      moduleSpecifier: `../remote-methods/${ dasherize(operationId) }.${ REMOTE_METHOD_FILE_SUFFIX }`,
      namedImports: [ classify([ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('-')) ],
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

  const withoutParameters = IsWithoutParameters(parameter);

  const typeParameters: (OptionalKind<TypeParameterDeclarationStructure> | string)[] = GetTypeParameters(parameter);

  if (IsCollectionResponse(parameter)) {
    importStructures.push({
      moduleSpecifier: '@rxap/utilities',
      namedImports: [ { name: 'ArrayElement' } ],
    });
    CreateDirective({
      filePath: fileName,
      name: operationId,
      prefix: parameter.options.prefix,
      parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
      returnType: `ArrayElement<${ responseType }>`,
      template: true,
      collection: true,
      sourceFile,
      withoutParameters,
      typeParameters,
    });
  }

  CreateDirective({
    filePath: fileName,
    name: operationId,
    prefix: parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
    returnType: responseType,
    template: true,
    collection: false,
    sourceFile,
    withoutParameters,
    typeParameters,
  });

  CreateDirective({
    filePath: fileName,
    name: operationId,
    prefix: parameter.options.prefix,
    parametersType: `OpenApiRemoteMethodParameter<${ parameterType }, ${ requestBodyType }>`,
    returnType: responseType,
    template: false,
    collection: false,
    sourceFile,
    withoutParameters,
    typeParameters,
  });

  sourceFile.addImportDeclarations(importStructures);

  sourceFile.organizeImports({
    ensureNewLineAtEndOfFile: true,
  });

}
