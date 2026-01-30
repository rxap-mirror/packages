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
  /**
   * The token or class to inject.
   */
  injectionToken: string;
  /**
   * The name of the property or parameter to assign the injection to.
   */
  parameterName: string;
  /**
   * If true, marks the injection as optional.
   */
  optional?: boolean;
  /**
   * The type of the property/parameter. Defaults to injectionToken.
   */
  type?: string;
  /**
   * Visibility scope of the property (public, private, protected).
   */
  scope?: Scope;
  /**
   * The module framework (Angular or NestJS).
   */
  module: Module;
}

/**
 * Coerces a dependency injection in a class constructor or as a property.
 * Handles both Angular and NestJS injection styles.
 *
 * @param sourceFile - The source file containing the class.
 * @param definition - The definition of the dependency injection.
 * @param structures - Optional import declaration structures to add.
 */
export function CoerceDependencyInjection(
  sourceFile: SourceFile,
  definition: InjectionDefinition,
  structures: Array<OptionalKind<ImportDeclarationStructure>> = [],
) {

  const classDeclaration = sourceFile.getClasses()[0];

  if (!classDeclaration) {
    throw new Error('Could not find class declaration');
  }

  const constructorDeclaration = classDeclaration.getConstructors()[0];
  if (constructorDeclaration) {
    if (constructorDeclaration.getParameters().some((parameter) => parameter.getName() === definition.parameterName)) {
      console.warn(`Parameter ${definition.parameterName} already exists in constructor`);
      return;
    }
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
      propertyDeclaration.setHasExclamationToken(true);
    }
    CoerceImports(sourceFile, {
      namedImports: [ 'Inject' ],
      moduleSpecifier: definition.module,
    });
  }

  CoerceImports(sourceFile, structures);
}
