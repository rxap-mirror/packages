import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';
import { CoerceClassConstructor } from '@rxap/schematics-ts-morph';
import { Scope } from 'ts-morph';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';

export type CoerceDialogTableActionRuleOptions = CoerceTableActionOptions

export function CoerceDialogTableActionRule(options: CoerceDialogTableActionRuleOptions) {
  let {
    tsMorphTransform,
    tableName,
    type,
  } = options;
  tsMorphTransform ??= () => ({});


  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);

      CoerceParameterDeclaration(constructorDeclaration, 'dialog').set({
        type: 'MatDialog',
        isReadonly: true,
        scope: Scope.Private,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'MatDialog' ],
        moduleSpecifier: '@angular/material/dialog',
      });

      CoerceImports(sourceFile, {
        namedImports: [ `${ classify(type) }DialogComponent` ],
        moduleSpecifier: `../../${ dasherize(type) }-dialog/${ dasherize(type) }-dialog.component`,
      });

      return {
        statements: [
          `console.log(\`action row type: ${ type }\`, parameters);`,
          `const ref = this.dialog.open(`,
          `  ${ classify(type) }DialogComponent,`,
          `  { data: parameters }`,
          ');',
          'return firstValueFrom(ref.afterClosed());',
        ],
        returnType: `Promise<void>`,
        ...tsMorphTransform(project, sourceFile, classDeclaration),
      };
    },
  });

}
