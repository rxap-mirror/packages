import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceDependencyInjection,
  CoerceImports,
  Module,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';

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

      CoerceDependencyInjection(sourceFile, {
        injectionToken: 'MatDialog',
        parameterName: 'dialog',
        scope: Scope.Private,
        module: Module.ANGULAR,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'MatDialog' ],
        moduleSpecifier: '@angular/material/dialog',
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'firstValueFrom' ],
        moduleSpecifier: 'rxjs',
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
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
