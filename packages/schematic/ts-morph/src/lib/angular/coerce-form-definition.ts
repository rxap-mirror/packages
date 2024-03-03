import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { CoercePropertyDeclaration } from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { AbstractControl } from '../types/abstract-control';
import { CoerceFormArray } from './coerce-form-definition-array';
import { CoerceFormControl } from './coerce-form-definition-form-control';
import { CoerceFormGroup } from './coerce-form-definition-group';
import { CoerceFormDefinitionTypeRule } from './coerce-form-definition-type';
import {
  CoerceFormDefinitionClass,
  GetFormDefinitionFilePath,
  GetFormDefinitionInterfaceName,
} from './form-definition-utilities';

export interface CoerceFormDefinitionOptions extends TsMorphAngularProjectTransformOptions {
  controlList?: ReadonlyArray<Required<AbstractControl>>;
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
    formTypeName: string,
    options: CoerceFormDefinitionOptions,
  ) => void;
}

export function CoerceFormControls(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  formTypeName: string,
  { controlList }: CoerceFormDefinitionOptions,
) {
  for (const control of controlList ?? []) {
    switch (control.role) {
      case 'group':
        CoerceFormGroup(sourceFile, classDeclaration, formTypeName, control);
        break;
      case 'control':
        CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);
        break;
      case 'array':
        CoerceFormArray(sourceFile, classDeclaration, formTypeName, control);
        break;
      default:
        throw new Error(`Unknown control role: ${ control.role }`);
    }
  }
}

export function CoerceFormDefinition(options: Readonly<CoerceFormDefinitionOptions>): Rule {
  const {
    coerceFormControls = CoerceFormControls,
    tsMorphTransform = noop,
    name,
  } = options;

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

      coerceFormControls!(sourceFile, classDeclaration, interfaceName, options);

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
