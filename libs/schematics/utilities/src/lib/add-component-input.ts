import {
  SourceFile,
  WriterFunction,
  OptionalKind,
  ImportDeclarationStructure,
  Scope
} from 'ts-morph';
import { GetComponentClass } from './get-component-class';

export interface ComponentInputDefinition {
  name: string;
  type: string | WriterFunction;
  selector?: string;
  required?: boolean;
  initializer?: string | WriterFunction;
}

export function AddComponentInput(
  sourceFile: SourceFile,
  componentInputDefinition: ComponentInputDefinition,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = []
): void {

  const componentClass = GetComponentClass(sourceFile);

  if (!componentClass.getProperty(componentInputDefinition.name)) {
    componentClass.addProperty({
      name:                componentInputDefinition.name,
      scope:               Scope.Public,
      type:                componentInputDefinition.type,
      initializer:         componentInputDefinition.initializer,
      hasQuestionToken:    !componentInputDefinition.initializer && !componentInputDefinition.required,
      hasExclamationToken: !componentInputDefinition.initializer && componentInputDefinition.required,
      decorators:          [
        {
          name:      'Input',
          arguments: componentInputDefinition.selector ? [ componentInputDefinition.selector ] : []
        }
      ]
    });
    sourceFile.addImportDeclaration({
      namedImports:    [ 'Input' ],
      moduleSpecifier: '@angular/core'
    });
  }
  sourceFile.addImportDeclarations(structures);

}
