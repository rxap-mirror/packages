import {
  ControlElement,
  ControlElementToValueContext
} from './control.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  PropertyDeclaration,
  Scope
} from 'ts-morph';
import { FormElement } from './form.element';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize } = strings;

@ElementExtends(ControlElement)
@ElementDef('array')
export class ArrayControlElement extends FormElement {

  public getType(): string {
    return 'I' + classify(this.id) + 'Form[]';
  }

  public toValue({ sourceFile, options, project, classDeclaration }: ControlElementToValueContext): PropertyDeclaration {
    const groupFilePath   = dasherize(this.id) + '.form';
    const groupSourceFile = project.getSourceFile(groupFilePath + '.ts') ?? project.createSourceFile(groupFilePath + '.ts');
    super.toValue({ sourceFile: groupSourceFile, project, options });

    const controlName = camelize(this.id);

    let controlProperty = classDeclaration.getProperty(controlName);

    const groupClassName = classify(this.id) + 'Form';

    if (!controlProperty) {
      controlProperty = classDeclaration.addProperty({
        name:                controlName,
        hasExclamationToken: true,
        scope:               Scope.Public,
        type:                `FormDefinitionArray<${groupClassName}>`,
        decorators:          [
          {
            name:      'UseFormArrayGroup',
            arguments: [ groupClassName ]
          }
        ]
      });
    }

    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: '@rxap/forms',
        namedImports:    [ 'UseFormArrayGroup', 'FormDefinitionArray' ]
      },
      {
        moduleSpecifier: `./${groupFilePath}`,
        namedImports:    [ groupClassName, 'I' + groupClassName ]
      }
    ]);

    return controlProperty;

  }

}
