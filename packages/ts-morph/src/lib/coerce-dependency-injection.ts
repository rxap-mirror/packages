import {
  ImportDeclarationStructure,
  OptionalKind,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceDecorator } from './coerce-decorator';
import { CoerceImports } from './coerce-imports';
import { CoercePropertyDeclaration } from './coerce-property-declaration';

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
  module: Module;
}

export function CoerceDependencyInjection(
  sourceFile: SourceFile,
  definition: InjectionDefinition,
  structures: Array<OptionalKind<ImportDeclarationStructure>> = [],
) {

  const classDeclaration = sourceFile.getClasses()[0];

  if (!classDeclaration) {
    throw new Error('Could not find class declaration');
  }

  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, definition.parameterName, {
    scope: definition.scope ?? Scope.Public,
    isReadonly: true,
  });

  if (definition.module === Module.ANGULAR) {
    if (definition.optional) {
      propertyDeclaration.setInitializer(`inject(${definition.injectionToken}, { optional: true })`);
    } else {
      propertyDeclaration.setInitializer(`inject(${definition.injectionToken})`);
    }
    CoerceImports(sourceFile, {
      namedImports: [ 'inject' ],
      moduleSpecifier: definition.module,
    });
  } else {
    CoerceDecorator(propertyDeclaration, 'Inject',{
      arguments: [ definition.injectionToken ],
    });
    if (definition.optional) {
      CoerceDecorator(propertyDeclaration, 'Optional',{
        arguments: [],
      });
      propertyDeclaration.setType(`${definition.type} | null`);
      propertyDeclaration.setInitializer('null');
      CoerceImports(sourceFile, {
        namedImports: [ 'Optional' ],
        moduleSpecifier: definition.module,
      });
    } else {
      propertyDeclaration.setType(definition.type ?? definition.injectionToken);
    }
    CoerceImports(sourceFile, {
      namedImports: [ 'Inject' ],
      moduleSpecifier: definition.module,
    });
  }

  CoerceImports(sourceFile, structures);
}
