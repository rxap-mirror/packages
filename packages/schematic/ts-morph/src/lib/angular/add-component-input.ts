import {
  ImportDeclarationStructure,
  JSDocStructure,
  OptionalKind,
  Scope,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetComponentClass } from './get-component-class';

export interface ComponentInputDefinition {
  name: string;
  type: string | WriterFunction;
  selector?: string;
  required?: boolean;
  initializer?: string | WriterFunction;
  docs?: Array<OptionalKind<JSDocStructure> | string>;
  setAccessor?: boolean;
}

export function AddComponentInput(
  sourceFile: SourceFile,
  componentInputDefinition: ComponentInputDefinition,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
): void {

  const componentClass = GetComponentClass(sourceFile);

  if (!componentClass.getConstructors().some(cotr => cotr.getParameters()
                                                         .some(param => !!param.getScope() &&
                                                           param.getName() ===
                                                           componentInputDefinition.name))) {

    if (componentInputDefinition.setAccessor) {
      if (!componentClass.getSetAccessor(componentInputDefinition.name)) {
        componentClass.addSetAccessor({
          name: componentInputDefinition.name,
          scope: Scope.Public,
          parameters: [
            {
              name: componentInputDefinition.name,
              type: componentInputDefinition.type,
            },
          ],
          docs: componentInputDefinition.docs,
          statements: [
            `this._${ componentInputDefinition.name } = ${ componentInputDefinition.name };`,
          ],
          decorators: [
            {
              name: 'Input',
              arguments: componentInputDefinition.selector ? [ componentInputDefinition.selector ] : [],
            },
          ],
        });
        if (!componentClass.getProperty('_' + componentInputDefinition.name)) {
          componentClass.addProperty({
            name: '_' + componentInputDefinition.name,
            scope: Scope.Private,
            type: componentInputDefinition.type,
            initializer: componentInputDefinition.initializer,
            hasQuestionToken: !componentInputDefinition.initializer && !componentInputDefinition.required,
            hasExclamationToken: !componentInputDefinition.initializer && componentInputDefinition.required,
          });
        }
        CoerceImports(sourceFile, {
          namedImports: [ 'Input' ],
          moduleSpecifier: '@angular/core',
        });
      }
    } else {
      if (!componentClass.getProperty(componentInputDefinition.name)) {
        componentClass.addProperty({
          name: componentInputDefinition.name,
          scope: Scope.Public,
          type: componentInputDefinition.type,
          initializer: componentInputDefinition.initializer,
          hasQuestionToken: !componentInputDefinition.initializer && !componentInputDefinition.required,
          hasExclamationToken: !componentInputDefinition.initializer && componentInputDefinition.required,
          docs: componentInputDefinition.docs,
          decorators: [
            {
              name: 'Input',
              arguments: componentInputDefinition.selector ? [ componentInputDefinition.selector ] : [],
            },
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'Input' ],
          moduleSpecifier: '@angular/core',
        });
      }
    }

  }
  CoerceImports(sourceFile, structures);

}
