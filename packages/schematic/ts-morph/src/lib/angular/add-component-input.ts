import { TypeImport } from '@rxap/ts-morph';
import {
  ImportDeclarationStructure,
  JSDocStructure,
  OptionalKind,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceComponentSignalInput } from './coerce-component-signal-input';
import { GetComponentClass } from './get-component-class';

export interface ComponentInputDefinition {
  name: string;
  type: string | TypeImport | WriterFunction;
  /**
   * The alias of the input binding
   */
  selector?: string;
  required?: boolean;
  initializer?: string | WriterFunction;
  docs?: Array<OptionalKind<JSDocStructure> | string>;
}

/**
 * Adds a signal based input (`input()` / `input.required()`) to the component class.
 */
export function AddComponentInput(
  sourceFile: SourceFile,
  componentInputDefinition: ComponentInputDefinition,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
): void {

  const componentClass = GetComponentClass(sourceFile);

  if (!componentClass.getConstructors().some(cotr => cotr.getParameters()
                                                         .some(param => !!param.getScope() &&
                                                           param.getName() ===
                                                           componentInputDefinition.name)) &&
    !componentClass.getProperty(componentInputDefinition.name)) {
    const property = CoerceComponentSignalInput(componentClass, componentInputDefinition.name, componentInputDefinition.type, {
      alias: componentInputDefinition.selector,
      isRequired: componentInputDefinition.required,
      initializer: componentInputDefinition.initializer,
    });
    if (componentInputDefinition.docs?.length) {
      property.addJsDocs(componentInputDefinition.docs);
    }
  }
  CoerceImports(sourceFile, structures);

}
