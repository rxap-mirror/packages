import {
  Rule,
  Tree,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import {
  OpenApiSchema,
  OpenApiSchemaFromPath
} from './schema';
import { readAngularJsonFile } from '@rxap/schematics/utilities';
import {
  OpenAPIV3,
  OpenAPI
} from 'openapi-types';
import * as http from 'http';
import * as https from 'https';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import {
  Project,
  IndentationText,
  QuoteKind,
  OptionalKind,
  ClassDeclarationStructure,
  Writers,
  ImportDeclarationStructure,
  ClassDeclaration,
  ParameterDeclarationStructure,
  PropertyDeclarationStructure,
  SetAccessorDeclarationStructure,
  Scope,
  SourceFile,
  ImportSpecifierStructure
} from 'ts-morph';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { camelize } from '@rxap/utilities';

const { dasherize, classify } = strings;

export interface CreateDirectiveRuleOptions {
  filePath: string;
  name: string;
  prefix: string;
  parametersType: string;
  returnType: string;
  template: boolean;
  collection: boolean;
}

export interface CreateDirectiveOptions extends CreateDirectiveRuleOptions {
  sourceFile: SourceFile,
  withoutParameters: boolean,
}

function AssertImportSpecifierStructureArray(obj: any): asserts obj is Array<OptionalKind<ImportSpecifierStructure>> {
  if (!obj || !Array.isArray(obj)) {
    throw new Error('Should be a array of OptionalKind<ImportSpecifierStructure>');
  }
}

export function CreateDirective({ filePath, sourceFile, name, prefix, parametersType, returnType, template, collection, withoutParameters }: CreateDirectiveOptions): void {

  const remoteMethodName = classify([ name, 'remote-method' ].join('-'));

  if (!sourceFile.getClass(remoteMethodName)) {
    console.warn(`A remote method class with the name '${remoteMethodName}' is not declared in the file '${filePath}'.`);
    return;
  }

  const directiveNameParts = [ remoteMethodName ];

  if (template) {
    directiveNameParts.push('template');
  }

  if (collection) {
    directiveNameParts.push('collection');
  }

  directiveNameParts.push('directive');

  const directiveName = classify(directiveNameParts.join('-'));

  const classDeclaration: ClassDeclaration | undefined = sourceFile.getClass(directiveName);

  if (classDeclaration) {
    console.warn(`A class with name '${directiveName}' already exists in the file '${filePath}'!`);
    return;
  }

  // region build selector
  const selectorFragments = [ prefix, name ];

  if (collection) {
    selectorFragments.push('collection');
  }

  selectorFragments.push('remote-method');

  const selector = camelize(selectorFragments.join('-'));
  // endregion

  const ctorsParameters: OptionalKind<ParameterDeclarationStructure>[] = [
    {
      name:       'remoteMethodLoader',
      type:       'RemoteMethodLoader',
      decorators: [
        {
          name:      'Inject',
          arguments: [ 'RemoteMethodLoader' ]
        }
      ]
    },
    {
      name:       'injector',
      type:       'Injector',
      decorators: [
        {
          name:      'Inject',
          arguments: [ 'INJECTOR' ]
        }
      ]
    },
    {
      name:       'remoteMethod',
      type:       remoteMethodName,
      decorators: [
        {
          name:      'Inject',
          arguments: [ remoteMethodName ]
        }
      ]
    }
  ];

  let ctorsSupperCallParameters = [ 'remoteMethodLoader', 'injector' ].join(', ');
  let directiveClassExtends: string;

  const remoteMethodDirectiveImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports:    [],
    moduleSpecifier: '@rxap/remote-method/directive'
  };

  const remoteMethodImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports:    [ { name: 'RemoteMethodLoader' } ],
    moduleSpecifier: '@rxap/remote-method'
  };

  const angularCoreImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports:    [
      { name: 'Inject' },
      { name: 'Directive' },
      { name: 'NgModule' },
      { name: 'INJECTOR' },
      { name: 'Injector' }
    ],
    moduleSpecifier: '@angular/core'
  };

  const directiveClassProperties: OptionalKind<PropertyDeclarationStructure>[] = [];

  const directiveClassSetAccessors: OptionalKind<SetAccessorDeclarationStructure>[] = [];

  const ctorsStatements: string[] = [];

  const importStructure: Array<OptionalKind<ImportDeclarationStructure>> = [
    angularCoreImportStructure,
    remoteMethodImportStructure,
    remoteMethodDirectiveImportStructure
  ];

  AssertImportSpecifierStructureArray(angularCoreImportStructure.namedImports);
  AssertImportSpecifierStructureArray(remoteMethodImportStructure.namedImports);
  AssertImportSpecifierStructureArray(remoteMethodDirectiveImportStructure.namedImports);

  if (template) {

    if (parametersType === 'void' || withoutParameters) {
      ctorsStatements.push('this.withoutParameters = true;');
    }

    angularCoreImportStructure.namedImports.push({ name: 'TemplateRef' });

    ctorsSupperCallParameters = [
      'template',
      'remoteMethodLoader',
      'injector',
      'viewContainerRef',
      'cdr'
    ].join(', ');

    directiveClassProperties.push({
      name:             'parameters',
      hasQuestionToken: true,
      scope:            Scope.Public,
      type:             parametersType,
      leadingTrivia:    '// tslint:disable-next-line:no-input-rename',
      decorators:       [
        {
          name:      'Input',
          arguments: [ writer => writer.quote(camelize([ selector, 'Parameters' ].join('-'))) ]
        }
      ]
    });

    if (collection) {

      ctorsSupperCallParameters = [ ctorsSupperCallParameters, 'differs', 'zone' ].join(', ');

      directiveClassExtends = `RemoteMethodTemplateCollectionDirective<${returnType}, ${parametersType}>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateCollectionDirective'
      });

      ctorsParameters.push(
        {
          name:       'template',
          type:       `TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<${returnType}>>`,
          decorators: [
            {
              name:      'Inject',
              arguments: [ 'TemplateRef' ]
            }
          ]
        },
        {
          name:       'differs',
          type:       'IterableDiffers',
          decorators: [
            {
              name:      'Inject',
              arguments: [ 'IterableDiffers' ]
            }
          ]
        },
        {
          name:       'zone',
          type:       'NgZone',
          decorators: [
            {
              name:      'Inject',
              arguments: [ 'NgZone' ]
            }
          ]
        }
      );

      remoteMethodDirectiveImportStructure.namedImports.push(
        { name: 'RemoteMethodTemplateCollectionDirectiveContext' },
        { name: 'RemoteMethodTemplateCollectionDirectiveErrorContext' }
      );

      directiveClassProperties.push(
        {
          name:             'errorTemplate',
          hasQuestionToken: true,
          leadingTrivia:    '// tslint:disable-next-line:no-input-rename',
          scope:            Scope.Public,
          type:             `TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>`,
          decorators:       [
            {
              name:      'Input',
              arguments: [ writer => writer.quote(camelize([ selector, 'Error' ].join('-'))) ]
            }
          ]
        },
        {
          name:             'emptyTemplate',
          leadingTrivia:    '// tslint:disable-next-line:no-input-rename',
          hasQuestionToken: true,
          scope:            Scope.Public,
          type:             'TemplateRef<void>',
          decorators:       [
            {
              name:      'Input',
              arguments: [ writer => writer.quote(camelize([ selector, 'Empty' ].join('-'))) ]
            }
          ]
        }
      );

      angularCoreImportStructure.namedImports.push(
        { name: 'IterableDiffers' },
        { name: 'NgZone' }
      );

    } else {

      directiveClassExtends = `RemoteMethodTemplateDirective<${returnType}, ${parametersType}>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateDirective'
      });

      ctorsParameters.push({
        name:       'template',
        type:       `TemplateRef<RemoteMethodTemplateDirectiveContext<${returnType}>>`,
        decorators: [
          {
            name:      'Inject',
            arguments: [ 'TemplateRef' ]
          }
        ]
      });

      remoteMethodDirectiveImportStructure.namedImports.push(
        { name: 'RemoteMethodTemplateDirectiveContext' },
        { name: 'RemoteMethodTemplateDirectiveErrorContext' }
      );

      directiveClassProperties.push(
        {
          name:             'errorTemplate',
          hasQuestionToken: true,
          type:             `TemplateRef<RemoteMethodTemplateDirectiveErrorContext>`,
          leadingTrivia:    '// tslint:disable-next-line:no-input-rename',
          scope:            Scope.Public,
          decorators:       [
            {
              name:      'Input',
              arguments: [ writer => writer.quote(camelize([ selector, 'Error' ].join('-'))) ]
            }
          ]
        }
      );

    }

    ctorsParameters.push(
      {
        name:       'viewContainerRef',
        type:       'ViewContainerRef',
        decorators: [
          {
            name:      'Inject',
            arguments: [ 'ViewContainerRef' ]
          }
        ]
      }, {
        name:       'cdr',
        type:       'ChangeDetectorRef',
        decorators: [
          {
            name:      'Inject',
            arguments: [ 'ChangeDetectorRef' ]
          }
        ]
      }
    );


    angularCoreImportStructure.namedImports.push(
      { name: 'ChangeDetectorRef' },
      { name: 'ViewContainerRef' },
      { name: 'Input' }
    );

  } else {
    directiveClassExtends = `RemoteMethodDirective<${returnType}, ${parametersType}>`;
    remoteMethodDirectiveImportStructure.namedImports.push({
      name: 'RemoteMethodDirective'
    });
  }

  const directiveClassStructure: OptionalKind<ClassDeclarationStructure> = {
    name:         directiveName,
    decorators:   [
      {
        name:      'Directive',
        arguments: Writers.object({
          selector: writer => writer.quote(`[${selector}]`),
          exportAs: writer => writer.quote(selector)
        })
      }
    ],
    extends:      directiveClassExtends,
    ctors:        [
      {
        parameters: ctorsParameters,
        statements: [
          `super(${ctorsSupperCallParameters});`,
          'this.remoteMethodOrIdOrToken = remoteMethod;',
          ...ctorsStatements
        ]
      }
    ],
    setAccessors: directiveClassSetAccessors,
    properties:   directiveClassProperties,
    isExported:   true
  };

  const directiveModuleClassStructure: OptionalKind<ClassDeclarationStructure> = {
    name:       directiveName + 'Module',
    decorators: [
      {
        name:      'NgModule',
        arguments: [
          Writers.object({
            declarations: `[ ${directiveName} ]`,
            exports:      `[ ${directiveName} ]`
          })
        ]
      }
    ],
    isExported: true
  };

  sourceFile.addClass(directiveClassStructure);
  sourceFile.addClass(directiveModuleClassStructure);
  sourceFile.addImportDeclarations(importStructure);

}

export function CoerceOpenApiProject(project: string): Rule {
  return (host: Tree) => {

    const angularJson = readAngularJsonFile(host);

    if (!angularJson.projects.hasOwnProperty(project)) {
      const defaultProjectPrefix = angularJson.projects[ angularJson.defaultProject ].prefix;
      return chain([
        externalSchematic('@nrwl/angular', 'library', {
          name:       project,
          importPath: `@${defaultProjectPrefix}/${project}`
        }),
        tree => {
          const baseTsconfig = JSON.parse(tree.read('/tsconfig.base.json')?.toString() ?? '{}');

          const paths = baseTsconfig?.compilerOptions?.paths ?? {};

          if (Object.keys(paths).length) {

            for (const key of Object.keys(paths)) {
              if (key.match(/\/open-api$/)) {
                delete paths[ key ];
                paths[ key + '/*' ] = [ 'libs/open-api/src/lib/*' ];
              }
            }

            tree.overwrite('/tsconfig.base.json', JSON.stringify(baseTsconfig, undefined, 2));

          }

        }
      ]);
    }

  };
}

export function IsOpenApiSchemaFromPath(options: OpenApiSchema): options is OpenApiSchemaFromPath {
  return options && options.hasOwnProperty('path');
}

export function httpRequest<T>(url: string): Promise<T> {

  function callback(resolve: (value: any) => void, reject: (error: any) => void) {

    return function(res: http.IncomingMessage) {

      const { statusCode } = res;
      const contentType    = res.headers[ 'content-type' ];

      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (contentType && !/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        // Consume response data to free up memory
        res.resume();
        console.error(error.message);
        reject(error.message);
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          console.error(e.message);
          reject(e.message);
        }
      });

    };

  }

  if (url.match(/^https/)) {
    return new Promise<T>((resolve, reject) => {
      https.get(url, callback(resolve, reject)).on('error', e => reject(e.message));
    });
  } else {
    return new Promise<T>((resolve, reject) => {
      http.get(url, callback(resolve, reject)).on('error', e => reject(e.message));
    });
  }

}

export function createOrOverwrite(filePath: string, content: string): Rule {
  return (tree) => {

    if (tree.exists(filePath)) {
      tree.overwrite(filePath, content);
    } else {
      tree.create(filePath, content);
    }

  };
}

export function IsReferenceObject(obj?: any): obj is OpenAPIV3.ReferenceObject {
  return !!obj && obj.hasOwnProperty('$ref');
}

export function getResponse(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject {

  if (operation.responses) {

    // tslint:disable:no-unnecessary-initializer
    let response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject | undefined = undefined;

    if (operation.responses.hasOwnProperty('default')) {
      response = operation.responses.default;
    } else if (operation.responses.hasOwnProperty('200')) {
      response = operation.responses[ '200' ];
    } else if (operation.responses.hasOwnProperty('201')) {
      response = operation.responses[ '201' ];
    }

    if (response) {

      if (IsReferenceObject(response)) {
        console.warn('Reference object are not supported in operation responses!');
      } else {
        if (response.content && response.content.hasOwnProperty('application/json')) {
          const schema = response.content[ 'application/json' ].schema;
          if (schema) {
            return schema;
          }
        }
      }

    }

  }

  return {
    type: 'any'
  };

}

export function isCollectionResponse(operation: OpenAPIV3.OperationObject): boolean {

  const response = getResponse(operation);

  if (!IsAnySchemaObject(response)) {
    if (!IsReferenceObject(response)) {
      return response.type === 'array';
    }
  }

  return false;
}

export function isWithoutParameters(operation: OpenAPIV3.OperationObject): boolean {
  return !operation.parameters || !operation.parameters.length;
}

export interface AnySchemaObject {
  type: 'any'
}

export function IsAnySchemaObject(obj: any): obj is AnySchemaObject {
  return obj && obj.hasOwnProperty('type') && obj.type === 'any';
}

export function getRequestBody(operation: OpenAPIV3.OperationObject): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | AnySchemaObject {

  if (operation.requestBody) {

    if (IsReferenceObject(operation.requestBody)) {
      throw new Error('Reference object are not supported in operation requestBody!');
    }

    const requestBodies: Record<string, OpenAPIV3.MediaTypeObject> | undefined = operation.requestBody.content;

    if (requestBodies) {

      if (IsReferenceObject(requestBodies)) {
        console.warn('Reference object are not supported in operation requestBody!');
      } else {
        if (requestBodies.hasOwnProperty('application/json')) {
          const schema = requestBodies[ 'application/json' ].schema;
          if (schema) {
            return schema;
          }
        }
      }

    }

  }

  return {
    type: 'any'
  };

}

/**
 *
 * @param operation
 * @param project
 * @param components
 */
export async function generateResponse(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Promise<void> {

  const response = getResponse(operation);

  if (!IsAnySchemaObject(response) && operation.operationId) {
    const operationId = operation.operationId;

    const generator = new TypescriptInterfaceGenerator(
      { ...response, components },
      { suffix: RESPONSE_FILE_SUFFIX, basePath: RESPONSE_BASE_PATH },
      project
    );

    console.log(`Generate response interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error) {
      console.error(`Failed to generate response interface for: ${operationId}`, error.message);
    }

  }

}

/**
 *
 * @param operation
 * @param project
 * @param components
 */
export async function generateRequestBody(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Promise<void> {

  const requestBodySchema = getRequestBody(operation);

  if (!IsAnySchemaObject(requestBodySchema) && operation.operationId) {
    const operationId = operation.operationId;

    const generator = new TypescriptInterfaceGenerator(
      { ...requestBodySchema, components },
      { suffix: REQUEST_BODY_FILE_SUFFIX, basePath: REQUEST_BODY_BASE_PATH },
      project
    );

    console.log(`Generate request body interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error) {
      console.error(`Failed to generate request body interface for: ${operationId}`, error.message);
    }

  }

}

/**
 *
 * @param operation
 * @param project
 * @param components
 */
export async function generateParameters(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Promise<void> {

  if (operation.parameters && operation.parameters.length && operation.operationId) {

    const operationId = operation.operationId;

    const properties: Record<string, OpenAPIV3.SchemaObject | AnySchemaObject | OpenAPIV3.ReferenceObject> = {};
    const required: string[]                                                                               = [];

    if (operation.parameters.some(parameter => IsReferenceObject(parameter))) {
      throw new Error('Reference object are not supported in the parameter definition!');
    }

    for (const parameter of operation.parameters.filter(param => !IsReferenceObject(param) && param.in !== 'header')) {

      if (IsReferenceObject(parameter)) {
        throw new Error('FATAL: Reference object are not supported in the parameter definition!');
      }

      properties[ parameter.name ] = parameter.schema ?? { type: 'any' };

      if (parameter.required) {
        required.push(parameter.name);
      }

    }

    const parametersSchema: OpenAPIV3.SchemaObject = {
      type:       'object',
      properties: properties as any,
      required
    };

    const generator = new TypescriptInterfaceGenerator(
      { ...parametersSchema, components },
      { suffix: PARAMETER_FILE_SUFFIX, basePath: PARAMETER_BASE_PATH },
      project
    );

    console.log(`Generate parameter interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error) {
      console.error(`Failed to generate parameter interface for: ${operationId}`, error.message);
    }

  }

}

export const REQUEST_BODY_FILE_SUFFIX = 'request-body';
export const REQUEST_BODY_BASE_PATH   = 'request-bodies';

export function getRequestBodyType(operation: OpenAPIV3.OperationObject): string {

  let requestBodyType = 'any';

  if (operation.operationId) {

    const requestBody = getRequestBody(operation);

    if (!IsAnySchemaObject(requestBody)) {

      requestBodyType = classify([ operation.operationId, REQUEST_BODY_FILE_SUFFIX ].join('-'));

    }

  }

  return requestBodyType;

}

export async function generateDataSource(
  operation: OpenAPIV3.OperationObject,
  project: Project
): Promise<void> {
  if (operation.operationId) {

    console.log(`Generate data source for operation: ${operation.operationId}`);

    try {

      const operationId = operation.operationId;

      const name     = [ operationId, DATA_SOURCE_FILE_SUFFIX ].join('.');
      const fileName = join(DATA_SOURCE_BASE_PATH, dasherize(name) + '.ts');

      const sourceFile = project.createSourceFile(fileName);

      const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
        {
          moduleSpecifier: '@rxap/open-api/data-source',
          namedImports:    [
            { name: 'RxapOpenApiDataSource' },
            { name: 'OpenApiDataSource' }
          ]
        },
        {
          moduleSpecifier: '@angular/core',
          namedImports:    [
            { name: 'Injectable' }
          ]
        }
      ];

      const responseType: string  = getResponseType(operation);
      const parameterType: string = getParameterType(operation);

      const classStructure: OptionalKind<ClassDeclarationStructure> = {
        name:       classify(name.replace(/\./g, '-')),
        decorators: [
          {
            name:      'Injectable',
            arguments: Writers.object({ providedIn: writer => writer.quote('root') })
          },
          {
            name:      'RxapOpenApiDataSource',
            arguments: writer => writer.quote(operationId)
          }
        ],
        extends:    writer => {
          writer.write('OpenApiDataSource');
          writer.write('<');
          writer.write(responseType);
          writer.write(', ');
          writer.write(parameterType);
          writer.write('>');
        },
        isExported: true
      };

      sourceFile.addImportDeclarations(importStructures);
      sourceFile.addClass(classStructure);

    } catch (error) {
      console.error(`Failed to generate data source for operation: ${operation.operationId}`);
    }

  } else {

    console.warn('Ensure all operation have a operation id.');

  }
}

export function getResponseType(operation: OpenAPIV3.OperationObject): string {

  let responseType = 'any';

  if (operation.operationId) {

    const response = getResponse(operation);

    // only generate the response interface if the type is not any
    if (!IsAnySchemaObject(response)) {
      responseType = classify([ operation.operationId, RESPONSE_FILE_SUFFIX ].join('-'));
    }

  }

  return responseType;

}

export const RESPONSE_BASE_PATH   = 'responses';
export const RESPONSE_FILE_SUFFIX = 'response';

export function getParameterType(operation: OpenAPIV3.OperationObject): string {

  let parameterType = 'any';

  if (operation.parameters && operation.parameters.length && operation.operationId) {

    const response = getResponse(operation);

    // only generate the response interface if the type is not any
    if (!IsAnySchemaObject(response)) {
      parameterType = classify([ operation.operationId, PARAMETER_FILE_SUFFIX ].join('-'));
    }

  }

  return parameterType;

}

export const PARAMETER_BASE_PATH   = 'parameters';
export const PARAMETER_FILE_SUFFIX = 'parameter';

export const DATA_SOURCE_BASE_PATH   = 'data-sources';
export const DATA_SOURCE_FILE_SUFFIX = 'data-source';

export const REMOTE_METHOD_BASE_PATH   = 'remote-methods';
export const REMOTE_METHOD_FILE_SUFFIX = 'remote-method';

export async function generateRemoteMethod(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  prefix: string
): Promise<void> {
  if (operation.operationId) {

    console.log(`Generate remote method for operation: ${operation.operationId}`);

    try {

      const operationId = operation.operationId;

      const name     = [ operationId, REMOTE_METHOD_FILE_SUFFIX ].join('.');
      const fileName = join(REMOTE_METHOD_BASE_PATH, dasherize(name) + '.ts');

      const sourceFile = project.createSourceFile(fileName);

      const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
        {
          moduleSpecifier: '@rxap/open-api/remote-method',
          namedImports:    [
            { name: 'RxapOpenApiRemoteMethod' },
            { name: 'OpenApiRemoteMethod' },
            { name: 'OpenApiRemoteMethodParameter' }
          ]
        },
        {
          moduleSpecifier: '@angular/core',
          namedImports:    [
            { name: 'Injectable' }
          ]
        }
      ];

      const responseType: string    = getResponseType(operation);
      const parameterType: string   = getParameterType(operation);
      const requestBodyType: string = getRequestBodyType(operation);

      const classStructure: OptionalKind<ClassDeclarationStructure> = {
        name:       classify(name.replace(/\./g, '-')),
        decorators: [
          {
            name:      'Injectable',
            arguments: Writers.object({ providedIn: writer => writer.quote('root') })
          },
          {
            name:      'RxapOpenApiRemoteMethod',
            arguments: writer => writer.quote(operationId)
          }
        ],
        extends:    writer => {
          writer.write('OpenApiRemoteMethod');
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

      const withoutParameters = isWithoutParameters(operation);

      if (isCollectionResponse(operation)) {
        importStructures.push({
          moduleSpecifier: '@rxap/utilities',
          namedImports: [ { name: 'ArrayElement' } ]
        });
        CreateDirective({
          filePath:       fileName,
          name:           operationId,
          prefix,
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
        prefix,
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
        prefix,
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

    } catch (error) {
      console.error(`Failed to generate remote method for operation: ${operation.operationId}`);
    }

  } else {

    console.warn('Ensure all operation have a operation id.');

  }
}

export function generateModels(
  schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Rule {
  return async (tree, context) => {

    for await (const [ name, schema ] of Object.entries(schemas)) {

      console.log(`Generate model '${name}'.`);

      const generator: TypescriptInterfaceGenerator = new TypescriptInterfaceGenerator(
        { ...schema, components },
        {
          suffix: 'model'
        },
        project
      );

      await generator.build(name).catch(error => {
        console.error(`Failed to generate model '${name}'.`, error.message);
        return null;
      });

    }

  };
}

export function IsOperationObject(obj: any): obj is OpenAPIV3.OperationObject {
  return obj && obj.hasOwnProperty('operationId');
}

export function IsHttpMethod(method: string): method is 'get' | 'put' | 'post' | 'delete' | 'patch' {
  return [ 'get', 'put', 'post', 'delete', 'patch' ].includes(method);
}

export function CreateFilesFromTsMorphProject(project: Project, basePath: string): Rule {
  return (tree, context) => {

    console.log('Start file creation ...');

    let indexFile = ``;

    for (const sourceFile of project.getSourceFiles()) {
      const filePath = join(basePath, sourceFile.getFilePath());
      console.log(`Process file: ${filePath}`);
      sourceFile.fixMissingImports();
      createOrOverwrite(filePath, sourceFile.getFullText())(tree, context);
      indexFile += `export * from './lib/${sourceFile.getDirectoryPath()}/${sourceFile.getBaseNameWithoutExtension()}';\n`;
    }

    createOrOverwrite(join(basePath, '..', 'index.ts'), indexFile)(tree, context);

  };
}

export function IgnoreOperation(tags: string[] = []): (operation: OpenAPIV3.OperationObject) => boolean {
  return operation => {

    if (operation?.tags?.length) {
      return operation.tags.some(tag => tags.includes(tag));
    }

    return false;

  };
}

export function getPrefix(host: Tree, projectName: string): string {

  const angularJson = readAngularJsonFile(host);
  const prefix      = angularJson.projects[ projectName ]?.prefix ?? angularJson.projects[ angularJson.defaultProject ]?.prefix;

  if (!prefix) {
    throw new Error(`Could not find prefix for project '${projectName}'!`);
  }

  return prefix;

}

export default function(options: OpenApiSchema): Rule {

  options.target = options.target ?? 'open-api';

  return async (host: Tree) => {

    let openapi: OpenAPI.Document;

    if (IsOpenApiSchemaFromPath(options)) {

      if (!host.exists(options.path)) {
        throw new Error('Could not find openapi file.');
      }

      openapi = JSON.parse(host.read(options.path)!.toString('utf-8'));

    } else if (options.url) {

      openapi = await httpRequest<OpenAPIV3.Document>(options.url);

    } else {
      throw new Error('Either the path or url must be defined');
    }

    const project = new Project({
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      },
      useInMemoryFileSystem: true
    });

    const basePath = `libs/${options.target}/src/lib`;

    const components = (openapi as any).components ?? (openapi as any).definitions ?? {};

    const modelSchemas = (openapi as any).components?.schemas ?? (openapi as any).definitions ?? {};

    const prefix = getPrefix(host, options.target);

    await generateModels(modelSchemas, project, components);

    for await (const methods of Object.values(openapi.paths)) {

      for await (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[ method ];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation([ 'hidden' ])(operation)) {

            console.log(`Ignore operation '${operation.operationId}'`);

          } else {

            await generateParameters(operation, project, components);
            await generateRequestBody(operation, project, components);
            await generateResponse(operation, project, components);

            if (method === 'get') {
              await generateDataSource(operation, project);
            }

            await generateRemoteMethod(operation, project, prefix);

          }

        }

      }

    }

    return chain([
      CoerceOpenApiProject(options.target),
      CreateFilesFromTsMorphProject(project, basePath)
    ]);

  };

}
