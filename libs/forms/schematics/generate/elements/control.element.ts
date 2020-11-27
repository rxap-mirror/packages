import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementDef,
  ElementAttribute,
  ElementRequired,
  ElementChildTextContent,
  ElementChildren,
  ElementChild
} from '@rxap/xml-parser/decorators';
import {
  PropertyDeclaration,
  ClassDeclaration,
  Scope,
  Writers,
  ObjectLiteralExpression,
  SourceFile
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { ValidatorElement } from './validators/validator.element';
import {
  OverwriteProperty,
  AddControlValidator,
  ToValueContext
} from '@rxap-schematics/utilities';
import { GenerateSchema } from '../schema';

const { dasherize, classify, camelize } = strings;

export interface ControlElementToValueContext extends ToValueContext<GenerateSchema> {
  classDeclaration: ClassDeclaration;
  sourceFile: SourceFile;
}

@ElementDef('type')
export class ControlTypeElement implements ParsedElement {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public from?: string;

  public toValue({ sourceFile }: { sourceFile: SourceFile }): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports:    [ this.name ],
        moduleSpecifier: this.from
      });
    }
    return this.name;
  }

}

@ElementDef('control')
export class ControlElement implements ParsedElement<PropertyDeclaration> {

  public __tag!: string;

  @ElementAttribute()
  @ElementRequired()
  public id!: string;

  @ElementChildTextContent({
    parseValue: rawValue => rawValue
  })
  public initial?: string;

  @ElementAttribute()
  public required!: boolean;

  @ElementAttribute()
  public readonly!: boolean;

  @ElementAttribute()
  public disabled!: boolean;

  @ElementAttribute()
  public hidden!: boolean;

  @ElementChild(ControlTypeElement)
  public type?: ControlTypeElement;

  @ElementChildren(ValidatorElement, { group: 'validators' })
  public validators!: ValidatorElement[];

  public validate(): boolean {
    return true;
  }

  public toValue({ classDeclaration, sourceFile, options, project }: ControlElementToValueContext): PropertyDeclaration {

    const controlName = camelize(this.id);

    let controlProperty = classDeclaration.getProperty(controlName);

    if (!controlProperty) {
      controlProperty = classDeclaration.addProperty({
        name:                controlName,
        hasExclamationToken: true,
        scope:               Scope.Public,
        decorators:          [
          {
            name:      'UseFormControl',
            arguments: []
          }
        ]
      });
    }

    controlProperty.setType(`RxapFormControl<${this.type?.toValue({ sourceFile }) ?? 'any'}>`);

    const decorators = controlProperty.getDecorators();

    for (const decorator of decorators) {

      switch (decorator.getName().trim()) {

        case 'UseFormControl':
          let controlOptions = decorator.getArguments()[ 0 ] ?? null;

          if (!controlOptions) {
            controlOptions = decorator.addArgument(Writers.object({}));
          }

          if (controlOptions instanceof ObjectLiteralExpression) {
            if (this.initial !== undefined) {
              OverwriteProperty(controlOptions, 'state', this.initial);
            }
            if (this.required) {
              AddControlValidator(
                'Validators.required',
                controlOptions
              );
              sourceFile.addImportDeclaration({
                moduleSpecifier: '@angular/forms',
                namedImports:    [ 'Validators' ]
              });
            }
            if (this.disabled !== undefined) {
              OverwriteProperty(controlOptions, 'disabled', this.disabled ? 'true' : 'false');
            }
            if (this.validators && this.validators.length) {
              for (const validator of this.validators) {
                validator.toValue({ controlOptions, sourceFile, options, project });
              }
            }
          } else {
            console.warn('The @UserFormControl parameter is not an object literal expression');
          }
          break;

      }

    }

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/forms',
      namedImports:    [ 'UseFormControl', 'RxapFormControl' ]
    });

    return controlProperty;

  }

}
