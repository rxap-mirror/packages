import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoercePropertyDeclaration } from '../nest/coerce-dto-class';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
} from '../nest/operation-id-utilities';
import { TsMorphAngularProjectTransformOptions } from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { AddComponentImport } from './add-component-import';
import {
  CoerceDialogComponentOptions,
  CoerceDialogComponentRule,
} from './coerce-dialog-component';

export interface CoerceDialogTableActionComponentOptions extends CoerceDialogComponentOptions,
                                                                 TsMorphAngularProjectTransformOptions {
  operationId: string;
  tableName: string;
  scope?: string;
}

export function CoerceDialogTableActionComponentRule(options: CoerceDialogTableActionComponentOptions) {
  let {
    project,
    feature,
    overwrite,
    template,
    tableName,
    directory,
    dialogName,
    operationId,
    scope,
  } = options;
  dialogName =
    CoerceSuffix(dialogName, '-dialog');
  if (!directory?.includes(tableName)) {
    if (directory?.endsWith(dialogName)) {
      throw new Error(`The directory must include the table name: ${ tableName } if directory ends with the dialog name: ${ dialogName }`);
    }
    directory = `${ directory }/${ tableName }`;
  }
  if (!directory.endsWith(dialogName)) {
    directory = `${ directory }/${ dialogName }`;
  }

  return CoerceDialogComponentRule({
    project,
    dialogName,
    feature,
    directory,
    overwrite,
    template,
    coerceSubmitMethod: (classDeclaration) => {
      CoerceClassMethod(classDeclaration, 'submit', {
        isAsync: true,
        statements: [
          'this.loading$.enable();',
          'try {',
          '  const response = await this.method.call({ parameters: { rowId: this.data.__rowId }, requestBody: this.state })',
          '  this.matDialogRef.close(response);',
          '} catch (error: any) {',
          '  this.snackBar.open(error.message, \'OK\', { duration: 5000 });',
          '} finally {',
          '  this.loading$.disable();',
          '}',
        ],
      });
    },
    tsMorphTransform: (project, [ componentSourceFile ], [ componentClass ]) => {
      AddComponentImport(componentSourceFile, 'MatSnackBarModule', '@angular/material/snack-bar');

      const [ constructorDeclaration ] = CoerceClassConstructor(componentClass);

      CoerceParameterDeclaration(constructorDeclaration, 'method').set({
        isReadonly: true,
        type: OperationIdToClassName(operationId),
      });

      CoerceImports(componentSourceFile, {
        moduleSpecifier: OperationIdToClassImportPath(operationId, scope),
        namedImports: [ OperationIdToClassName(operationId) ],
      });

      CoerceParameterDeclaration(constructorDeclaration, 'snackBar').set({
        isReadonly: true,
        type: 'MatSnackBar',
      });

      CoerceImports(componentSourceFile, {
        moduleSpecifier: '@angular/material/snack-bar',
        namedImports: [ 'MatSnackBar' ],
      });

      CoerceParameterDeclaration(constructorDeclaration, 'data').set({
        isReadonly: true,
        type: `I${ classify(tableName) }`,
      });

      CoerceImports(componentSourceFile, [
        {
          moduleSpecifier: `../${ tableName }`,
          namedImports: [ `I${ classify(tableName) }` ],
        },
      ]);

      CoerceParameterDeclaration(constructorDeclaration, 'matDialogRef').set({
        isReadonly: true,
        type: `MatDialogRef<any>`,
      });

      CoerceImports(componentSourceFile, [
        {
          moduleSpecifier: '@angular/material/dialog',
          namedImports: [ 'MatDialogRef' ],
        },
      ]);

      CoercePropertyDeclaration(componentClass, 'state', {
        initializer: '{} as any',
        type: OperationIdToRequestBodyClassName(operationId),
      });

      CoerceImports(componentSourceFile, [
        {
          moduleSpecifier: OperationIdToRequestBodyClassImportPath(operationId, scope),
          namedImports: [ OperationIdToRequestBodyClassName(operationId) ],
        },
      ]);

    },
  });
}
