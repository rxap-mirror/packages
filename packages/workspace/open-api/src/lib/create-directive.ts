import {
  camelize,
  classify,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  PropertyDeclarationStructure,
  Scope,
  SetAccessorDeclarationStructure,
  Writers,
} from 'ts-morph';
import { REMOTE_METHOD_FILE_SUFFIX } from './const';
import { CreateDirectiveOptions } from './options';

/**
 * Asserts that the given object is an array of `OptionalKind<ImportSpecifierStructure>`.
 * This function is a type guard that narrows the type of `obj` from `any` to `Array<OptionalKind<ImportSpecifierStructure>>`
 * by asserting the specific structure expected in the array elements.
 *
 * @param obj - The object to be checked.
 * @throws {Error} Throws an error if `obj` is not an array or if it does not match the expected structure.
 */
function AssertImportSpecifierStructureArray(obj: any): asserts obj is Array<OptionalKind<ImportSpecifierStructure>> {
  if (!obj || !Array.isArray(obj)) {
    throw new Error('Should be a array of OptionalKind<ImportSpecifierStructure>');
  }
}

/**
 *
 *
 * Dynamically creates and registers an Angular directive for a remote method invocation based on the provided options.
 * The directive can optionally handle templates and collections, and is configured to be injectable with necessary services.
 *
 * @param {CreateDirectiveOptions} options - Configuration options for creating the directive, including:
 * - `filePath`: The file path where the directive is to be added.
 * - `sourceFile`: The TypeScript source file object to which the directive will be added.
 * - `name`: The base name for the directive, used in naming and selector generation.
 * - `prefix`: Optional prefix for the directive selector.
 * - `parametersType`: The TypeScript type of the parameters that the directive accepts.
 * - `returnType`: The TypeScript type of the value returned by the remote method.
 * - `template`: Boolean indicating whether the directive uses a template.
 * - `collection`: Boolean indicating whether the directive handles a collection of items.
 * - `withoutParameters`: Boolean indicating if the directive operates without parameters.
 *
 * The function constructs the directive by defining its class, imports, selector, and injectable services based on the options.
 * It checks for existing class declarations with the same name to avoid duplicates. If a duplicate is found, a warning is logged
 * and the function exits early. Otherwise, it proceeds to set up the directive's metadata, constructor, and class properties.
 *
 * The directive's selector is built using the provided `name`, `prefix`, and other options. The class is decorated with `@Directive`
 * and configured with properties and dependency injections as needed for operation.
 *
 * If `template` is true, additional configurations are applied to handle templates, including setting up input properties for
 * parameters, error templates, and empty states. Depending on whether `collection` is true, the directive is extended from either
 * `RemoteMethodTemplateDirective` or `RemoteMethodTemplateCollectionDirective`.
 *
 * Finally, the newly created directive class is added to the source file along with necessary Angular and custom imports.
 *
 */
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
  typeParameters,
                                }: CreateDirectiveOptions): void {
  const remoteMethodName = classify([ name, REMOTE_METHOD_FILE_SUFFIX ].join('-'));

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
  const selectorFragments: string[] = [];

  if (prefix) {
    selectorFragments.push(prefix);
  }

  selectorFragments.push(name);

  if (collection) {
    selectorFragments.push('collection');
  }

  selectorFragments.push('remote-method');

  const selector = camelize(selectorFragments.join('-'));
  // endregion

  const ctorsParameters: OptionalKind<ParameterDeclarationStructure>[] = [
    {
      name: 'remoteMethodLoader',
      type: 'RemoteMethodLoader',
      decorators: [
        {
          name: 'Inject',
          arguments: [ 'RemoteMethodLoader' ],
        },
      ],
    }, {
      name: 'injector',
      type: 'Injector',
      decorators: [
        {
          name: 'Inject',
          arguments: [ 'INJECTOR' ],
        },
      ],
    }, {
      name: 'remoteMethod',
      type: remoteMethodName,
      decorators: [
        {
          name: 'Inject',
          arguments: [ remoteMethodName ],
        },
      ],
    },
  ];

  let ctorsSupperCallParameters = [ 'remoteMethodLoader', 'injector' ].join(', ');
  let directiveClassExtends: string;

  const remoteMethodDirectiveImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports: [],
    moduleSpecifier: '@rxap/remote-method/directive',
  };

  const remoteMethodImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports: [ { name: 'RemoteMethodLoader' } ],
    moduleSpecifier: '@rxap/remote-method',
  };

  const angularCoreImportStructure: OptionalKind<ImportDeclarationStructure> = {
    namedImports: [
      { name: 'Inject' }, { name: 'Directive' }, { name: 'INJECTOR' }, { name: 'Injector' },
    ],
    moduleSpecifier: '@angular/core',
  };

  const directiveClassProperties: OptionalKind<PropertyDeclarationStructure>[] = [];

  const directiveClassSetAccessors: OptionalKind<SetAccessorDeclarationStructure>[] = [];

  const ctorsStatements: string[] = [];

  const importStructure: Array<OptionalKind<ImportDeclarationStructure>> = [
    angularCoreImportStructure, remoteMethodImportStructure, remoteMethodDirectiveImportStructure,
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
      'template', 'remoteMethodLoader', 'injector', 'viewContainerRef', 'cdr',
    ].join(', ');

    directiveClassProperties.push({
      name: 'parameters',
      hasQuestionToken: true,
      scope: Scope.Public,
      type: parametersType,
      // leadingTrivia: '// eslint-disable-next-line @angular-eslint/no-input-rename',
      hasDeclareKeyword: true,
      decorators: [
        {
          name: 'Input',
          arguments: [
            (writer) => writer.quote(camelize([ selector, 'Parameters' ].join('-'))),
          ],
        },
      ],
    });

    if (collection) {
      ctorsSupperCallParameters = [
        ctorsSupperCallParameters, 'differs', 'zone',
      ].join(', ');

      directiveClassExtends = `RemoteMethodTemplateCollectionDirective<${ returnType }, ${ parametersType }>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateCollectionDirective',
      });

      ctorsParameters.push({
        name: 'template',
        type: `TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<${ returnType }>>`,
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'TemplateRef' ],
          },
        ],
      }, {
        name: 'differs',
        type: 'IterableDiffers',
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'IterableDiffers' ],
          },
        ],
      }, {
        name: 'zone',
        type: 'NgZone',
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'NgZone' ],
          },
        ],
      });

      remoteMethodDirectiveImportStructure.namedImports.push(
        { name: 'RemoteMethodTemplateCollectionDirectiveContext' },
        { name: 'RemoteMethodTemplateCollectionDirectiveErrorContext' },
      );

      directiveClassProperties.push({
        name: 'errorTemplate',
        hasQuestionToken: true,
        hasDeclareKeyword: true,
        // leadingTrivia: '// eslint-disable-next-line @angular-eslint/no-input-rename',
        scope: Scope.Public,
        type: `TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>`,
        decorators: [
          {
            name: 'Input',
            arguments: [
              (writer) => writer.quote(camelize([ selector, 'Error' ].join('-'))),
            ],
          },
        ],
      }, {
        name: 'emptyTemplate',
        hasDeclareKeyword: true,
        // leadingTrivia: '// eslint-disable-next-line @angular-eslint/no-input-rename',
        hasQuestionToken: true,
        scope: Scope.Public,
        type: 'TemplateRef<void>',
        decorators: [
          {
            name: 'Input',
            arguments: [
              (writer) => writer.quote(camelize([ selector, 'Empty' ].join('-'))),
            ],
          },
        ],
      });

      angularCoreImportStructure.namedImports.push({ name: 'IterableDiffers' }, { name: 'NgZone' });
    } else {
      directiveClassExtends = `RemoteMethodTemplateDirective<${ returnType }, ${ parametersType }>`;
      remoteMethodDirectiveImportStructure.namedImports.push({
        name: 'RemoteMethodTemplateDirective',
      });

      ctorsParameters.push({
        name: 'template',
        type: `TemplateRef<RemoteMethodTemplateDirectiveContext<${ returnType }>>`,
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'TemplateRef' ],
          },
        ],
      });

      remoteMethodDirectiveImportStructure.namedImports.push(
        { name: 'RemoteMethodTemplateDirectiveContext' },
        { name: 'RemoteMethodTemplateDirectiveErrorContext' },
      );

      directiveClassProperties.push({
        name: 'errorTemplate',
        hasQuestionToken: true,
        hasDeclareKeyword: true,
        type: `TemplateRef<RemoteMethodTemplateDirectiveErrorContext>`,
        // leadingTrivia: '// eslint-disable-next-line @angular-eslint/no-input-rename',
        scope: Scope.Public,
        decorators: [
          {
            name: 'Input',
            arguments: [
              (writer) => writer.quote(camelize([ selector, 'Error' ].join('-'))),
            ],
          },
        ],
      });
    }

    ctorsParameters.push({
      name: 'viewContainerRef',
      type: 'ViewContainerRef',
      decorators: [
        {
          name: 'Inject',
          arguments: [ 'ViewContainerRef' ],
        },
      ],
    }, {
      name: 'cdr',
      type: 'ChangeDetectorRef',
      decorators: [
        {
          name: 'Inject',
          arguments: [ 'ChangeDetectorRef' ],
        },
      ],
    });

    angularCoreImportStructure.namedImports.push(
      { name: 'ChangeDetectorRef' },
      { name: 'ViewContainerRef' },
      { name: 'Input' },
    );
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
          standalone: 'true',
        }),
      },
    ],
    extends: directiveClassExtends,
    ctors: [
      {
        parameters: ctorsParameters,
        statements: [
          `super(${ ctorsSupperCallParameters });`, 'this.remoteMethodOrIdOrToken = remoteMethod;', ...ctorsStatements,
        ],
      },
    ],
    setAccessors: directiveClassSetAccessors,
    properties: directiveClassProperties,
    isExported: true,
    typeParameters,
  };

  sourceFile.addClass(directiveClassStructure);
  sourceFile.addImportDeclarations(importStructure);
}
