import { Rule } from '@angular-devkit/schematics';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceClass,
  CoerceImports,
  CoerceSourceFile,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';
import {
  ClassDeclaration,
  CodeBlockWriter,
  Decorator,
  PropertyDeclaration,
  SourceFile,
} from 'ts-morph';
import { TsMorphAngularProjectTransformRule } from '../ts-morph-transform';
import { AbstractControl } from '../types/abstract-control';
import {
  GetFormDefinitionClassName,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionControlOptions extends Required<AbstractControl>,
                                                            TsMorphAngularProjectTransformOptions {
  tsMorphTransform?: (sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
  formName: string;
  coerceFormTypeControl?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    formTypeName: string,
    control: Required<AbstractControl>,
  ) => void;
  coerceFormControl?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    formTypeName: string,
    control: Required<AbstractControl>,
  ) => { propertyDeclaration: PropertyDeclaration, decoratorDeclaration: Decorator } | void;
}

export function isAngularValidator(validator: string) {
  return [
    /^min\(.+\)/,
    /^max\(.+\)/,
    'required',
    'requiredTrue',
    'email',
    /^minLength\(.+\)/,
    /^maxLength\(.+\)/,
    /^pattern\(.+\)/,
    'nullValidator',
  ].some(pattern => typeof pattern === 'string' ? pattern === validator : pattern.test(validator));
}

export function CoerceFormDefinitionControl(options: Readonly<CoerceFormDefinitionControlOptions>): Rule {
  const {
    coerceFormControl = noop,
    tsMorphTransform = noop,
    coerceFormTypeControl = noop,
    formName,
  } = options;

  return TsMorphAngularProjectTransformRule(options, (project) => {

    const className = GetFormDefinitionClassName({ name: formName });
    const sourceFile = CoerceSourceFile(project, '/' + CoerceSuffix(formName, '.form.ts'));
    const classDeclaration = CoerceClass(sourceFile, className, { isExported: true });

    // region add control to interface
    const interfaceName = GetFormDefinitionInterfaceName({ name: formName });
    coerceFormTypeControl(sourceFile, classDeclaration, interfaceName, options);
    // endregion

    coerceFormControl(sourceFile, classDeclaration, interfaceName, options);

    tsMorphTransform(sourceFile, classDeclaration);

  });

}

export function FormControlValidatorCodeBlockWriter(sourceFile: SourceFile, control: Required<Pick<AbstractControl, 'validatorList' | 'isRequired'>>) {
  return (w: CodeBlockWriter) => {
    w.write('[');
    if (control.validatorList.length > 1 || (control.validatorList.length && control.isRequired)) {
      w.newLine();
    }
    for (let i = 0; i < control.validatorList.length; i++) {
      const validator = control.validatorList[i];
      if (isAngularValidator(validator)) {
        CoerceImports(sourceFile, {
          namedImports: [ 'Validators' ],
          moduleSpecifier: '@angular/forms',
        });
        w.write('Validators.');
      } else {
        CoerceImports(sourceFile, {
          namedImports: [ 'RxapValidators' ],
          moduleSpecifier: '@rxap/forms',
        });
        w.write('RxapValidators.');
      }
      w.write(validator);
      if (i < control.validatorList.length - 1) {
        w.write(',');
      }
    }
    if (control.isRequired) {
      if (control.validatorList.length) {
        w.write(',');
      }
      CoerceImports(sourceFile, {
        namedImports: [ 'Validators' ],
        moduleSpecifier: '@angular/forms',
      });
      w.write('Validators.required');
    }
    if (control.validatorList.length > 1 || (control.validatorList.length && control.isRequired)) {
      w.newLine();
    }
    w.write(']');
  };

}

export function FormControlStateCodeBlockWriter(sourceFile: SourceFile, control: Required<Pick<AbstractControl, 'state'>>) {
  return (w: CodeBlockWriter) => {
    if (typeof control.state === 'string') {
      w.write(control.state);
    } else if (typeof control.state === 'function') {
      control.state(w);
    } else {
      throw new Error('Invalid state type');
    }
  };
}
