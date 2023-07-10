import {
  ImportDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  SourceFile,
  Writers,
} from 'ts-morph';
import {CoerceClassConstructor} from './coerce-class-constructor';
import {CoerceImports} from './ts-morph/index';

export enum Module {
  ANGULAR = '@angular/core',
  NEST = '@nestjs/common'
}

export interface InjectionDefinition {
  injectionToken: string;
  parameterName: string;
  optional?: boolean;
  type?: string;
  scope?: Scope;
  module?: Module
}

export function AddDependencyInjection(
  sourceFile: SourceFile,
  definition: InjectionDefinition,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
) {

  if (!definition.module) {
    definition.module = Module.ANGULAR;
  }

  const classDeclaration = sourceFile.getClasses()[0];

  if (!classDeclaration) {
    throw new Error('Could not find class declaration');
  }

  const constructorDeclarations = CoerceClassConstructor(classDeclaration);
  const constructorDeclaration = constructorDeclarations[0];

  if (constructorDeclaration.getParameter(definition.parameterName)) {
    return;
  }

  const constructorParameter: OptionalKind<ParameterDeclarationStructure> = {
    name: definition.parameterName,
    type: definition.type ?? definition.injectionToken,
    scope: definition.scope ?? Scope.Public,
    isReadonly: true,
    decorators: [
      {
        name: 'Inject',
        arguments: [definition.injectionToken],
      },
    ],
  };

  if (definition.optional) {
    constructorParameter.decorators?.unshift({
      name: 'Optional',
      arguments: [],
    });
    constructorParameter.type = Writers.intersectionType(
      definition.type ?? definition.injectionToken,
      'null',
    );
    CoerceImports(sourceFile, {
      namedImports: ['Optional'],
      moduleSpecifier: definition.module,
    });
  }

  constructorDeclaration.addParameter(constructorParameter);

  CoerceImports(sourceFile, {
    namedImports: ['Inject'],
    moduleSpecifier: definition.module,
  });

  CoerceImports(sourceFile, structures);
}
