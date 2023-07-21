import { classify } from '@rxap/schematics-utilities';
import {
  Scope,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';

export interface CoerceFormTableActionOptions extends CoerceTableActionOptions {
  loadOperationId?: string;
  scope: string;
}

export function CoerceFormTableActionRule(options: CoerceFormTableActionOptions) {
  let {
    type,
    loadOperationId,
    tsMorphTransform,
    scope,
  } = options;
  tsMorphTransform ??= () => ({});

  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/core',
        namedImports: [ 'ChangeDetectorRef', 'Inject', 'INJECTOR', 'Injector' ],
      });
      const openFormWindowMethod = `Open${ classify(type) }FormWindowMethod`;
      CoerceImports(sourceFile, {
        moduleSpecifier: `../../${ type }-form/open-${ type }-form-window.method`,
        namedImports: [ openFormWindowMethod ],
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'firstValueFrom' ],
        moduleSpecifier: 'rxjs',
      });
      if (loadOperationId) {
        CoerceImports(sourceFile, {
          moduleSpecifier: OperationIdToClassImportPath(loadOperationId, scope),
          namedImports: [ OperationIdToClassName(loadOperationId) ],
        });
      }

      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
      CoerceParameterDeclaration(constructorDeclaration, 'openFormWindow').set({
        name: 'openFormWindow',
        type: openFormWindowMethod,
        isReadonly: true,
        scope: Scope.Private,
        decorators: [
          {
            name: 'Inject',
            arguments: [ openFormWindowMethod ],
          },
        ],
      });
      CoerceParameterDeclaration(constructorDeclaration, 'injector').set({
        type: 'Injector',
        isReadonly: true,
        scope: Scope.Private,
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'INJECTOR' ],
          },
        ],
      });
      CoerceParameterDeclaration(constructorDeclaration, 'cdr').set({
        type: 'ChangeDetectorRef',
        isReadonly: true,
        scope: Scope.Private,
      });
      if (loadOperationId) {
        CoerceParameterDeclaration(constructorDeclaration, 'getInitial').set({
          isReadonly: true,
          scope: Scope.Private,
          type: OperationIdToClassName(loadOperationId),
        });
      }
      const statements: (string | WriterFunction | StatementStructures)[] = [];
      statements.push(`console.log(\`action row type: ${ type }\`, parameters);`);
      if (loadOperationId) {
        statements.push(`const { __rowId: rowId } = parameters;`);
        statements.push(`if (!rowId) { throw new Error('The table action ${ type } is called with a row object that does not have the property __rowId.'); }`);
        statements.push(`const initial = await this.getInitial.call({parameters: { rowId }});`);
      } else {
        statements.push(`const initial = parameters;`);
      }
      statements.push(`this.cdr.markForCheck();`);
      statements.push(`return firstValueFrom(this.openFormWindow.call(initial, {injector: this.injector, context: { rowId }}));`);

      return {
        statements,
        isAsync: true,
        scope: Scope.Public,
        returnType: 'Promise<any>',
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
