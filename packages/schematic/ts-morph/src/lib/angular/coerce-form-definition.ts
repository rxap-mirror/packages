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
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface FormDefinitionControl {
  name: string;
  type: string;
}

export interface CoerceFormDefinitionOptions {
  project: string;
  feature: string;
  directory?: string;
  controlList: FormDefinitionControl[];
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
  {controlList}: CoerceFormDefinitionOptions,
) {
  const interfaceDeclaration = CoerceInterface(sourceFile, formTypeName);
  interfaceDeclaration.setIsExported(true);
  for (const control of controlList) {
    CoercePropertyDeclaration(interfaceDeclaration, camelize(control.name), {type: control.type});
  }
}

export function CoerceFormControls(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  {controlList}: CoerceFormDefinitionOptions,
) {
  for (const control of controlList) {
    const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, camelize(control.name), {
      type: `RxapFormControl<${control.type}>`,
      hasExclamationToken: true,
      scope: Scope.Public,
      isReadonly: true,
    });
    CoerceDecorator(propertyDeclaration, {
      name: 'UseFormControl',
      arguments: ['{}'],
    });
  }
  CoerceImports(sourceFile, {
    namedImports: ['RxapFormControl', 'UseFormControl'],
    moduleSpecifier: '@rxap/forms',
  });
}

export function CoerceFormDefinition(options: Readonly<CoerceFormDefinitionOptions>): Rule {
  let {controlList, coerceFormControls, name, tsMorphTransform, coerceFormType} = options;

  tsMorphTransform ??= () => undefined;
  coerceFormType ??= CoerceInterfaceFormType;
  coerceFormControls ??= CoerceFormControls;

  const className = CoerceSuffix(classify(name), 'Form');

  return TsMorphAngularProjectTransform(options, (project: Project) => {

    const sourceFile = CoerceSourceFile(project, '/' + CoerceSuffix(name, '.form.ts'));
    const classDeclaration = CoerceClass(sourceFile, className, {isExported: true});

    // region add controls to interface
    const interfaceName = `I${className}`;
    coerceFormType!(sourceFile, classDeclaration, interfaceName, options);
    if (!classDeclaration.getImplements().some(implement => implement.getText().startsWith('FormType'))) {
      classDeclaration.addImplements(`FormType<${interfaceName}>`);
    }
    CoerceImports(sourceFile, {
      namedImports: ['FormType'],
      moduleSpecifier: '@rxap/forms',
    });
    // endregion

    CoercePropertyDeclaration(classDeclaration, 'rxapFormGroup', {
      type: `RxapFormGroup<${interfaceName}>`,
      hasExclamationToken: true,
      isReadonly: true,
      scope: Scope.Public,
    });
    CoerceImports(sourceFile, {
      namedImports: ['RxapFormGroup'],
      moduleSpecifier: '@rxap/forms',
    });

    coerceFormControls!(sourceFile, classDeclaration, options);

    // region add class decorators
    CoerceDecorator(classDeclaration, {
      name: 'RxapForm',
      arguments: [w => w.quote(name)],
    });
    CoerceImports(sourceFile, {
      namedImports: ['RxapForm'],
      moduleSpecifier: '@rxap/forms',
    });

    CoerceDecorator(classDeclaration, {
      name: 'Injectable',
      arguments: [],
    });
    CoerceImports(sourceFile, {
      namedImports: ['Injectable'],
      moduleSpecifier: '@angular/core',
    });
    // endregion

    tsMorphTransform!(sourceFile, classDeclaration);

  });

}
