import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceClassProperty } from '../ts-morph/coerce-class-property';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { AddComponentImport } from './add-component-import';
import {
  CoerceComponentOptions,
  CoerceComponentRule,
} from './coerce-component';

export interface CoerceDialogComponentOptions extends Omit<CoerceComponentOptions, 'tsMorphTransform' | 'name'> {
  dialogName: string;
  title?: string;
  tsMorphTransform?: (
    project: Project,
    [ componentSourceFile ]: [ SourceFile ],
    [ componentClass ]: [ ClassDeclaration ],
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
    flat,
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
      flat,
      tsMorphTransform: (_, [ componentSourceFile ], [ componentClass ]) => {
        AddComponentImport(componentSourceFile, 'FlexLayoutModule', '@angular/flex-layout');
        AddComponentImport(componentSourceFile, 'MatDialogModule', '@angular/material/dialog');
        AddComponentImport(componentSourceFile, 'MatButtonModule', '@angular/material/button');
        AddComponentImport(componentSourceFile, 'MatProgressBarModule', '@angular/material/progress-bar');
        AddComponentImport(componentSourceFile, 'CommonModule', '@angular/common');

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
            moduleSpecifier: '@rxap/rxjs',
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
        tsMorphTransform!(_, [ componentSourceFile ], [ componentClass ], options);
        coerceSubmitMethod!(componentClass, options);
      },
    }),
  ]);
}
