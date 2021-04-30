import {
  Rule,
  Tree,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { readAngularJsonFile } from '@rxap/schematics/utilities';
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
  SourceFile,
  ClassDeclaration,
  SetAccessorDeclarationStructure,
  ParameterDeclarationStructure,
  PropertyDeclarationStructure,
  Scope,
  ImportSpecifierStructure
} from 'ts-morph';
import {
  FixMissingImports,
  ApplyTsMorphProject
} from '@rxap/schematics-ts-morph';
import {
  GenerateOperation,
  GenerateParameter,
  GetResponseType,
  GetParameterType,
  GetRequestBodyType,
  IsWithoutParameters,
  IsCollectionResponse,
  LoadOpenApiConfig
} from '@rxap/schematics-open-api';
import { OpenApiSchema, OpenApiSchemaBase } from './schema';
import { camelize } from '@rxap/utilities';
import { GetProjectPrefix } from '@rxap/schematics-utilities';

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

export async function GenerateDataSource(
  parameter: GenerateParameter,
): Promise<void> {

  if (parameter.method.toUpperCase() !== 'GET') {
    return;
  }

  const operationId = parameter.operationId;

  const name     = [ operationId, DATA_SOURCE_FILE_SUFFIX ].join('.');
  const fileName = join(DATA_SOURCE_BASE_PATH, dasherize(name) + '.ts');

  const sourceFile = parameter.project.createSourceFile(fileName);

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

  const responseType: string  = GetResponseType(parameter);
  const parameterType: string = GetParameterType(parameter);

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
}

export const DATA_SOURCE_BASE_PATH   = 'data-sources';
export const DATA_SOURCE_FILE_SUFFIX = 'data-source';

export const REMOTE_METHOD_BASE_PATH   = 'remote-methods';
export const REMOTE_METHOD_FILE_SUFFIX = 'remote-method';

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

export async function GenerateRemoteMethod(
  parameter: GenerateParameter<OpenApiSchemaBase>,
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
      namedImports:    [
        { name: 'Injectable' }
      ]
    }
  ];

  switch (parameter.options.transport) {

    case 'amplify':
      importStructures.push({
        moduleSpecifier: '@rxap/amplify-open-api',
        namedImports: [
          { name: 'AmplifyOpenApiRemoteMethod' }
        ]
      });
      break;

    default:
      importStructures.push({
        moduleSpecifier: '@rxap/open-api/remote-method',
        namedImports: [
          { name: 'OpenApiRemoteMethod' }
        ]
      });
      break;

  }

  const responseType: string    = GetResponseType(parameter);
  const parameterType: string   = GetParameterType(parameter);
  const requestBodyType: string = GetRequestBodyType(parameter);

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
      namedImports: [ { name: 'ArrayElement' } ]
    });
    CreateDirective({
      filePath:       fileName,
      name:           operationId,
      prefix: parameter.options.prefix,
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
    prefix: parameter.options.prefix,
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
    prefix: parameter.options.prefix,
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

export default function(options: OpenApiSchema): Rule {

  return async (host: Tree) => {

    const openapi = await LoadOpenApiConfig(host, options);

    const project = new Project({
      manipulationSettings:  {
        indentationText:   IndentationText.TwoSpaces,
        quoteKind:         QuoteKind.Single,
        useTrailingCommas: true
      },
      useInMemoryFileSystem: true
    });

    if (!options.project) {
      options.project = 'open-api';
    }

    const basePath = `libs/${options.project}/src/lib`;

    options.prefix = options.prefix ?? GetProjectPrefix(host, options.project);

    if (!options.debug) {
      // TODO : reset the hack after the schematic execution is finished
      console.debug = function () {}
    }

    return chain([
      CoerceOpenApiProject(options.project),
      () => GenerateOperation(openapi, project, options, [
        GenerateDataSource,
        GenerateRemoteMethod,
      ]),
      ApplyTsMorphProject(project, basePath),
      FixMissingImports(),
    ]);

  };

}
