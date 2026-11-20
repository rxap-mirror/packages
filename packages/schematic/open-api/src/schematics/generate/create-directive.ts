import { strings } from '@angular-devkit/core';
import {
  ClassDeclaration,
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  Scope,
  Writers,
} from 'ts-morph';
import { CreateDirectiveOptions } from './options';

function AssertImportSpecifierStructureArray(obj: any): asserts obj is Array<OptionalKind<ImportSpecifierStructure>> {
  if (!obj || !Array.isArray(obj)) {
    throw new Error('Should be a array of OptionalKind<ImportSpecifierStructure>');
  }
}

const {
  classify,
  camelize,
} = strings;

export function CreateDirective({
                                  filePath,
                                  sourceFile,
                                  name,
                                  prefix,
                                  parametersType,
                                  returnType,
                                  template,
                                  collection,
                                  withoutParameters,
                                }: CreateDirectiveOptions): void {
  const remoteMethodName = classify([ name, 'remote-method' ].join('-'));

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
    console.warn(`A class with name '${ directiveName }' already exists in the file '${ filePath }'!`);
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

  let directiveClassExtends: string;

  const remoteMethodDirectiveImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports: [ { name: 'RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN' } ],
    moduleSpecifier: '@rxap/remote-method/directive',
  };

  const angularCoreImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports: [ { name: 'Directive' } ],
    moduleSpecifier: '@angular/core',
  };

  const directiveClassProperties: OptionalKind<PropertyDeclarationStructure>[] = [];

  const importStructure: Array<OptionalKind<ImportDeclarationStructure>> = [
    angularCoreImportStructure, remoteMethodDirectiveImportStructure,
  ];

  AssertImportSpecifierStructureArray(angularCoreImportStructure.namedImports);
  AssertImportSpecifierStructureArray(remoteMethodDirectiveImportStructure.namedImports);

  const signalInput = (
    propertyName: string,
    type: string,
    alias: string,
  ): OptionalKind<PropertyDeclarationStructure> => ({
    name: propertyName,
    scope: Scope.Public,
    isReadonly: true,
    hasOverrideKeyword: true,
    initializer: `input<${ type }>(undefined, { alias: '${ alias }' })`,
  });

  if (template) {

    angularCoreImportStructure.namedImports.push({ name: 'TemplateRef' }, { name: 'input' });

    directiveClassProperties.push(
      signalInput('parameters', parametersType, camelize([ selector, 'Parameters' ].join('-'))),
    );

    if (parametersType === 'void' || withoutParameters) {
      directiveClassProperties.push({
        name: 'withoutParameters',
        scope: Scope.Public,
        isReadonly: true,
        hasOverrideKeyword: true,
        initializer: `input(true, { alias: '${ camelize([ selector, 'WithoutParameters' ].join('-')) }' })`,
      });
    }

    if (collection) {
      directiveClassExtends = `RemoteMethodTemplateCollectionDirective<${ returnType }, ${ parametersType }>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateCollectionDirective',
      }, {
        name: 'RemoteMethodTemplateCollectionDirectiveErrorContext',
      });

      directiveClassProperties.push(
        signalInput(
          'errorTemplate',
          'TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>',
          camelize([ selector, 'Error' ].join('-')),
        ),
        signalInput('emptyTemplate', 'TemplateRef<void>', camelize([ selector, 'Empty' ].join('-'))),
      );
    } else {
      directiveClassExtends = `RemoteMethodTemplateDirective<${ returnType }, ${ parametersType }>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateDirective',
      }, {
        name: 'RemoteMethodTemplateDirectiveErrorContext',
      });

      directiveClassProperties.push(
        signalInput(
          'errorTemplate',
          'TemplateRef<RemoteMethodTemplateDirectiveErrorContext>',
          camelize([ selector, 'Error' ].join('-')),
        ),
      );
    }
  } else {
    directiveClassExtends = `RemoteMethodDirective<${ returnType }, ${ parametersType }>`;
    remoteMethodDirectiveImportStructure.namedImports.push({
      name: 'RemoteMethodDirective',
    });
  }

  const directiveClassStructure: OptionalKind<ClassDeclarationStructure> = {
    name: directiveName,
    decorators: [
      {
        name: 'Directive',
        arguments: Writers.object({
          selector: (writer) => writer.quote(`[${ selector }]`),
          exportAs: (writer) => writer.quote(selector),
          // the remote method is resolved by the base directive through the token
          providers: `[ { provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useExisting: ${ remoteMethodName } } ]`,
        }),
      },
    ],
    extends: directiveClassExtends,
    properties: directiveClassProperties,
    isExported: true,
  };

  sourceFile.addClass(directiveClassStructure);
  sourceFile.addImportDeclarations(importStructure);
}
