import { Rule } from '@angular-devkit/schematics';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { CoerceInterface } from '../ts-morph/coerce-interface';
import { CoercePropertyDeclaration } from '../nest/coerce-dto-class';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  CoerceFormControl,
  CoerceInterfaceFormTypeControl,
} from './coerce-form-definition-control';
import { FormDefinitionControl } from '../types';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceFormDefinitionOptions extends TsMorphAngularProjectTransformOptions {
  controlList: Array<Required<FormDefinitionControl>>;
  name: string;
  tsMorphTransform?: (sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
  coerceFormType?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    formTypeName: string,
    options: CoerceFormDefinitionOptions,
  ) => void;
  coerceFormControls?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceFormDefinitionOptions,
  ) => void;
}

export function CoerceInterfaceFormType(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  { controlList }: CoerceFormDefinitionOptions,
) {
  if (sourceFile.getTypeAlias(formTypeName)) {
    console.log(`Type alias ${ formTypeName } already exists! Skip interface generation`);
    return;
  }
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  for (const control of controlList) {
    CoerceInterfaceFormTypeControl(sourceFile, classDeclaration, formTypeName, control);
  }
}

export function CoerceFormControls(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  { controlList }: CoerceFormDefinitionOptions,
) {
  for (const control of controlList) {
    CoerceFormControl(sourceFile, classDeclaration, control);
  }
  CoerceImports(sourceFile, {
    namedImports: [ 'RxapFormControl', 'UseFormControl', 'RxapValidators' ],
    moduleSpecifier: '@rxap/forms',
  });
  CoerceImports(sourceFile, {
    namedImports: [ 'Validators' ],
    moduleSpecifier: '@angular/forms',
  });
}

export function CoerceFormDefinition(options: Readonly<CoerceFormDefinitionOptions>): Rule {
  let {
    controlList,
    coerceFormControls,
    name,
    tsMorphTransform,
    coerceFormType,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {
  };
  coerceFormType ??= CoerceInterfaceFormType;
  coerceFormControls ??= CoerceFormControls;

  const className = CoerceSuffix(classify(name), 'Form');

  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, '/' + CoerceSuffix(name, '.form.ts'));
    const classDeclaration = CoerceClass(sourceFile, className, { isExported: true });

    // region add controls to interface
    const interfaceName = `I${ className }`;
    coerceFormType!(sourceFile, classDeclaration, interfaceName, options);
    if (!classDeclaration.getImplements().some(implement => implement.getText().startsWith('FormType'))) {
      classDeclaration.addImplements(`FormType<${ interfaceName }>`);
    }
    CoerceImports(sourceFile, {
      namedImports: [ 'FormType' ],
      moduleSpecifier: '@rxap/forms',
    });
    // endregion

    CoercePropertyDeclaration(classDeclaration, 'rxapFormGroup').set({
      type: `RxapFormGroup<${ interfaceName }>`,
      hasExclamationToken: true,
      isReadonly: true,
      scope: Scope.Public,
    });
    CoerceImports(sourceFile, {
      namedImports: [ 'RxapFormGroup' ],
      moduleSpecifier: '@rxap/forms',
    });

    coerceFormControls!(sourceFile, classDeclaration, options);

    // region add class decorators
    CoerceDecorator(classDeclaration, 'RxapForm').set({ arguments: [ w => w.quote(name) ] });
    CoerceImports(sourceFile, {
      namedImports: [ 'RxapForm' ],
      moduleSpecifier: '@rxap/forms',
    });

    CoerceDecorator(classDeclaration, 'Injectable').set({ arguments: [] });
    CoerceImports(sourceFile, {
      namedImports: [ 'Injectable' ],
      moduleSpecifier: '@angular/core',
    });
    // endregion

    tsMorphTransform!(sourceFile, classDeclaration);

  });

}
