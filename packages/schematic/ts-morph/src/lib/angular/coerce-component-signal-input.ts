import {
  CoerceImports,
  CoercePropertyDeclaration,
  TypeImport,
  WriteType,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  PropertyDeclaration,
  Scope,
  SourceFile,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';
import { GetComponentClass } from './get-component-class';

export interface ComponentSignalInputDefinition {
  /**
   * The alias of the input binding (input<T>(init, { alias: '...' }))
   */
  alias?: string;
  /**
   * Whether the input is required (input.required<T>()). A required input has no initial value.
   */
  isRequired?: boolean;
  /**
   * The initial value of the input. Ignored for required inputs.
   */
  initializer?: string | WriterFunction;
}

/**
 * Coerces a signal based input (`input()` / `input.required()`) in an Angular component.
 *
 * Signal-first replacement for the decorator based CoerceComponentInput.
 */
export function CoerceComponentSignalInput(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  name: string,
  type: string | TypeImport | WriterFunction,
  { alias, isRequired, initializer }: ComponentSignalInputDefinition = {},
): PropertyDeclaration {

  const classDeclaration = sourceFileOrClassDeclaration.isKind(SyntaxKind.ClassDeclaration) ?
                           sourceFileOrClassDeclaration :
                           GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = classDeclaration.getSourceFile();

  CoerceImports(sourceFile, {
    namedImports: [ 'input' ],
    moduleSpecifier: '@angular/core',
  });

  const writeType = WriteType(type, sourceFile);

  const property = CoercePropertyDeclaration(classDeclaration, name);

  property.set({
    scope: Scope.Public,
    isReadonly: true,
    initializer: w => {
      w.write(isRequired ? 'input.required<' : 'input<');
      writeType(w);
      w.write('>(');
      const hasInitializer = !isRequired && initializer !== undefined;
      if (hasInitializer) {
        if (typeof initializer === 'string') {
          w.write(initializer);
        } else {
          initializer!(w);
        }
      }
      if (alias) {
        if (hasInitializer) {
          w.write(', ');
        } else if (!isRequired) {
          // input<T>(undefined, { alias }) - the options object is the second argument
          w.write('undefined, ');
        }
        w.write(`{ alias: '${ alias }' }`);
      }
      w.write(')');
    },
  });

  return property;
}
