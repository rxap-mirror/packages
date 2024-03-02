import { Rule } from '@angular-devkit/schematics';
import {
  camelize,
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  CoercePropertyDeclaration,
  WriteType,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  Decorator,
  PropertyDeclaration,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceSourceFile } from '../coerce-source-file';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { AbstractControl } from '../types/abstract-control';

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
    control: Required<AbstractControl>,
  ) => { propertyDeclaration: PropertyDeclaration, decoratorDeclaration: Decorator };
}

export function CoerceInterfaceFormTypeControl(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: Required<AbstractControl>,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name)).set({ type: WriteType(control, sourceFile) });
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

export function CoerceFormControl(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  control: Required<AbstractControl>,
) {
  CoerceImports(sourceFile, {
    namedImports: [ 'RxapFormControl', 'UseFormControl' ],
    moduleSpecifier: '@rxap/forms',
  });
  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name)).set({
    type: w => {
      w.write('RxapFormControl<');
      WriteType(control, sourceFile)(w);
      w.write('>');
    },
    hasExclamationToken: true,
    scope: Scope.Public,
    isReadonly: true,
  });
  const decoratorDeclaration = CoerceDecorator(propertyDeclaration, 'UseFormControl').set({
    arguments: [
      w => {
        const items: Record<string, string | WriterFunction> = {};
        if (control.validatorList?.length || control.isRequired) {
          items['validators'] = w => {
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
        if (control.state) {
          items['state'] = w => {
            if (typeof control.state === 'string') {
              w.write(control.state);
            } else if (typeof control.state === 'function') {
              control.state(w);
            } else {
              throw new Error('Invalid state type');
            }
          };
        } else if (control.isArray) {
          items['state'] = '[]';
        }
        if (Object.keys(items).length) {
          Writers.object(items)(w);
        }
      },
    ],
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'RxapFormControl', 'UseFormControl' ],
    moduleSpecifier: '@rxap/forms',
  });
  return {
    propertyDeclaration,
    decoratorDeclaration,
  };
}

export function CoerceFormDefinitionControl(options: Readonly<CoerceFormDefinitionControlOptions>): Rule {
  let {
    coerceFormControl,
    tsMorphTransform,
    coerceFormTypeControl,
    formName,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {
  };
  coerceFormTypeControl ??= CoerceInterfaceFormTypeControl;
  coerceFormControl ??= CoerceFormControl;

  const className = CoerceSuffix(classify(formName), 'Form');

  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, '/' + CoerceSuffix(formName, '.form.ts'));
    const classDeclaration = CoerceClass(sourceFile, className, { isExported: true });

    // region add control to interface
    const interfaceName = `I${ className }`;
    coerceFormTypeControl!(sourceFile, classDeclaration, interfaceName, options);
    // endregion

    coerceFormControl!(sourceFile, classDeclaration, options);

    tsMorphTransform!(sourceFile, classDeclaration);

  });

}
