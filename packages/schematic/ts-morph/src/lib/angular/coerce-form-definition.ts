import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoercePropertyDeclaration } from '../nest/coerce-dto-class';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { FormDefinitionControl } from '../types/form-definition-control';
import { CoerceFormControl } from './coerce-form-definition-control';
import { CoerceFormDefinitionTypeRule } from './coerce-form-definition-type';
import {
  CoerceFormDefinitionClass,
  GetFormDefinitionFilePath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionOptions extends TsMorphAngularProjectTransformOptions {
  controlList?: Array<Required<FormDefinitionControl>>;
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

export function CoerceFormControls(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  { controlList }: CoerceFormDefinitionOptions,
) {
  for (const control of controlList ?? []) {
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
    coerceFormControls,
    tsMorphTransform,
    name,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {
  };
  coerceFormControls ??= CoerceFormControls;

  const interfaceName = GetFormDefinitionInterfaceName(options);

  return chain([
    TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

      const classDeclaration = CoerceFormDefinitionClass(sourceFile, options);

      // region add controls to interface
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

    }, [ GetFormDefinitionFilePath(options) ]),
    CoerceFormDefinitionTypeRule(options),
  ]);

}
