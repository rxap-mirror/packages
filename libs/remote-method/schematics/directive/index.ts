import {
  Rule,
  Tree,
  chain
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { DirectiveSchema } from './schema';
import {
  Project,
  QuoteKind,
  IndentationText,
  SourceFile,
  ClassDeclaration,
  OptionalKind,
  ClassDeclarationStructure,
  Writers,
  ImportDeclarationStructure,
  ParameterDeclarationStructure,
  ImportSpecifierStructure,
  PropertyDeclarationStructure,
  Scope,
  SetAccessorDeclarationStructure
} from 'ts-morph';
import {
  classify,
  camelize,
  dasherize
} from '@rxap/utilities';
import { readAngularJsonFile } from '@rxap/schematics/utilities';


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
}

function AssertImportSpecifierStructureArray(obj: any): asserts obj is Array<OptionalKind<ImportSpecifierStructure>> {
  if (!obj || !Array.isArray(obj)) {
    throw new Error('Should be a array of OptionalKind<ImportSpecifierStructure>');
  }
}

export function CreateDirective({ filePath, sourceFile, name, prefix, parametersType, returnType, template, collection }: CreateDirectiveOptions): void {

  const remoteMethodName = classify([ name, 'remote-method' ].join('-'));

  if (!sourceFile.getClass(remoteMethodName)) {
    console.warn(`A remote method class with the name '${remoteMethodName}' is not declared in the file '${filePath}'.`);
    return;
  }

  const directiveName = classify([ remoteMethodName, 'directive' ].join('-'));

  const classDeclaration: ClassDeclaration | undefined = sourceFile.getClass(directiveName);

  if (classDeclaration) {
    console.warn(`A class with name '${directiveName}' already exists in the file '${filePath}'!`);
    return;
  }

  // region build selector
  const selectorFragments = [ prefix, name ];

  if (collection) {
    selectorFragments.push('collection')
  }

  selectorFragments.push('remote-method')

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

    if (parametersType === 'void') {
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
      scope: Scope.Public,
      type:             parametersType,
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
          scope: Scope.Public,
          type:             `TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>`,
          decorators:       [
            {
              name:      'Input',
              arguments: [ writer => writer.quote(camelize([ selector, 'Error' ].join('-'))) ]
            }
          ]
        },
        {
          name: 'emptyTemplate',
          leadingTrivia: '// tslint:disable-next-line:no-input-rename',
          hasQuestionToken: true,
          scope: Scope.Public,
          type: 'TemplateRef<void>',
          decorators: [
            {
              name: 'Input',
              arguments: [ writer => writer.quote(camelize([ selector, 'Empty' ].join('-'))) ]
            }
          ]
        },
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
          scope: Scope.Public,
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
    name:       directiveName,
    decorators: [
      {
        name:      'Directive',
        arguments: Writers.object({
          selector: writer => writer.quote(`[${selector}]`),
          exportAs: writer => writer.quote(selector)
        })
      }
    ],
    extends:    directiveClassExtends,
    ctors:      [
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
    properties: directiveClassProperties,
    isExported: true
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

export function CreateDirectiveRule(options: CreateDirectiveRuleOptions): Rule {
  return tree => {

    if (!tree.exists(options.filePath)) {
      console.warn(`The file '${options.filePath}' does not exists!`);
      return;
    }

    const project = new Project({
      manipulationSettings:  { quoteKind: QuoteKind.Single, indentationText: IndentationText.TwoSpaces, useTrailingCommas: true },
      useInMemoryFileSystem: true
    });

    const sourceFile: SourceFile = project.createSourceFile(options.filePath, tree.get(options.filePath)!.content.toString('utf-8'));

    CreateDirective({
      ...options,
      sourceFile,
    });

    if (sourceFile) {
      tree.overwrite(options.filePath, sourceFile.getFullText());
    }

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

export default function(options: DirectiveSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    const filePath = join(options.path, [ dasherize(options.name), 'remote-method', 'ts' ].join('.'));

    const prefix = getPrefix(host, options.project);

    return chain([
      CreateDirectiveRule({
        prefix,
        filePath,
        name: options.name,
        template: options.template || options.collection,
        collection: options.collection,
        returnType: options.returnType,
        parametersType: options.parametersType,
      })
    ]);

  };

}
