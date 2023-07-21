import { Rule } from '@angular-devkit/schematics';
import {
  camelize,
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { CoercePropertyDeclaration } from '../nest/coerce-dto-class';
import {
  ClassDeclaration,
  Decorator,
  PropertyDeclaration,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { WriteType } from '../ts-morph/write-type';
import { FormDefinitionControl } from '../types/form-definition-control';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceFormDefinitionControlOptions extends Required<FormDefinitionControl> {
  project: string;
  feature: string;
  directory?: string;
  tsMorphTransform?: (sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
  formName: string;
  coerceFormTypeControl?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    formTypeName: string,
    control: Required<FormDefinitionControl>,
  ) => void;
  coerceFormControl?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    control: Required<FormDefinitionControl>,
  ) => { propertyDeclaration: PropertyDeclaration, decoratorDeclaration: Decorator };
}

export function CoerceInterfaceFormTypeControl(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  control: Required<FormDefinitionControl>,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name)).set({ type: WriteType(control) });
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
  control: Required<FormDefinitionControl>,
) {
  const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name)).set({
    type: w => {
      w.write('RxapFormControl<');
      WriteType(control)(w);
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
                w.write('Validators.');
              } else {
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
    namedImports: [ 'RxapFormControl', 'UseFormControl', 'RxapValidators' ],
    moduleSpecifier: '@rxap/forms',
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'Validators' ],
    moduleSpecifier: '@angular/forms',
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

  return TsMorphAngularProjectTransform(options, (project) => {

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
