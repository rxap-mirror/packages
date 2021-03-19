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
@ElementDef('group')
export class GroupControlElement extends FormElement {

  public __parent!: FormElement;

  public get controlPath(): string {
    return [ this.__parent.id, this.id ].join('.');
  }

  public getType(): string {
    return 'I' + classify(this.id) + 'Form';
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
        type:                groupClassName,
        decorators:          [
          {
            name:      'UseFormGroup',
            arguments: [ groupClassName ]
          }
        ]
      });
    }

    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: '@rxap/forms',
        namedImports:    [ 'UseFormGroup' ]
      },
      {
        moduleSpecifier: `./${groupFilePath}`,
        namedImports:    [ groupClassName, 'I' + groupClassName ]
      }
    ]);

    return controlProperty;

  }

}
