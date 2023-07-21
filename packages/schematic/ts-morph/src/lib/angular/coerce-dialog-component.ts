import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceComponentRule,
  TemplateOptions,
} from './coerce-component';
import { AddNgModuleExport } from './add-ng-module-export';
import { CoerceClassProperty } from '../ts-morph/coerce-class-property';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceClassMethod } from '../nest/coerce-class-method';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { AddNgModuleImport } from '../add-ng-module-import';
import { CoerceClassConstructor } from '../coerce-class-constructor';

export interface CoerceDialogComponentOptions {
  dialogName: string;
  project: string;
  feature: string;
  title?: string;
  overwrite?: boolean;
  directory?: string;
  template?: TemplateOptions;
  tsMorphTransform?: (
    project: Project,
    [ componentSourceFile, moduleSourceFile ]: [ SourceFile, SourceFile ],
    [ componentClass, moduleClass ]: [ ClassDeclaration, ClassDeclaration ],
    options: CoerceDialogComponentOptions,
  ) => void;
  coerceSubmitMethod?: (classDeclaration: ClassDeclaration, options: CoerceDialogComponentOptions) => void;
}

export function DefaultDialogSubmitMethod(
  classDeclaration: ClassDeclaration,
  options: CoerceDialogComponentOptions,
): void {
  CoerceClassMethod(classDeclaration, 'submit', {
    isAsync: true,
    statements: [ 'this.matDialogRef.close(true);' ],
  });
}

export function CoerceDialogComponentRule(options: CoerceDialogComponentOptions): Rule {
  let {
    template,
    coerceSubmitMethod,
    tsMorphTransform,
    directory,
    overwrite,
    title,
    dialogName,
    project,
    feature,
  } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {
  };
  coerceSubmitMethod ??= DefaultDialogSubmitMethod;
  return chain([
    () => console.log('Coerce dialog component ...'),
    CoerceComponentRule({
      project,
      name: dialogName,
      feature,
      directory,
      overwrite,
      template,
      tsMorphTransform: (_, [ componentSourceFile, moduleSourceFile ], [ componentClass, moduleClass ]) => {
        AddNgModuleImport(moduleSourceFile, 'FlexLayoutModule', '@angular/flex-layout');
        AddNgModuleImport(moduleSourceFile, 'MatDialogModule', '@angular/material/dialog');
        AddNgModuleImport(moduleSourceFile, 'MatButtonModule', '@angular/material/button');
        AddNgModuleImport(moduleSourceFile, 'MatProgressBarModule', '@angular/material/progress-bar');
        AddNgModuleImport(moduleSourceFile, 'CommonModule', '@angular/common');
        AddNgModuleExport(moduleSourceFile, 'MatDialogModule', '@angular/material/dialog');

        CoerceClassProperty(componentClass, 'loading$', {
          initializer: `new ToggleSubject(true)`,
          isReadonly: true,
        });
        CoerceClassProperty(componentClass, 'invalid$', {
          initializer: `new ToggleSubject(true)`,
          isReadonly: true,
        });
        CoerceImports(componentSourceFile, [
          {
            namedImports: [ 'ToggleSubject' ],
            moduleSpecifier: '@rxap/utilities/rxjs',
          },
          {
            namedImports: [ 'MatDialogRef', 'MAT_DIALOG_DATA' ],
            moduleSpecifier: '@angular/material/dialog',
          },
          {
            namedImports: [ 'Inject' ],
            moduleSpecifier: '@angular/core',
          },
        ]);
        const [ constructorDeclaration ] = CoerceClassConstructor(componentClass);
        CoerceParameterDeclaration(constructorDeclaration, 'matDialogRef', {
          isReadonly: true,
          type: 'MatDialogRef<any>',
        });
        CoerceParameterDeclaration(constructorDeclaration, 'data', {
          isReadonly: true,
          type: 'any',
          decorators: [
            {
              name: 'Inject',
              arguments: [ 'MAT_DIALOG_DATA' ],
            },
          ],
        });
        tsMorphTransform!(_, [ componentSourceFile, moduleSourceFile ], [ componentClass, moduleClass ], options);
        coerceSubmitMethod!(componentClass, options);
      },
    }),
  ]);
}
