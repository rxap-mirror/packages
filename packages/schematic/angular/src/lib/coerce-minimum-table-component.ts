import {
  AddComponentAnimations,
  CoerceComponentOptions,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceComponentImport,
  CoerceComponentInput,
  CoerceDefaultClassExport,
  CoerceImports,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { NormalizedMinimumTableOptions } from './minimum-table-options';
import { TableModifiers } from './table-options';

export interface CoerceMinimumTableComponentOptions extends CoerceComponentOptions {
  table: NormalizedMinimumTableOptions;
}

export function CoerceMinimumTableComponentRule(options: Readonly<CoerceMinimumTableComponentOptions>) {

  const {
    tsMorphTransform = noop,
    table: {
      columnList,
      actionList,
      headerButton,
      modifiers,
    }
  } = options;

  return CoerceComponentRule({
    ...options,
    tsMorphTransform: (project, [sourceFile], [classDeclaration]) => {

      AddComponentAnimations(sourceFile, 'RowAnimation', '@rxap/material-table-system');

      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/material-table-system',
          namedImports: ['RowAnimation'],
        }
      ]);

      // region inputs
      CoerceComponentInput(classDeclaration, 'parameters', 'Observable<Record<string, unknown>>');
      CoerceImports(sourceFile, {
        moduleSpecifier: 'rxjs',
        namedImports: ['Observable'],
      });
      // endregion

      // region angular component imports
      CoerceComponentImport(classDeclaration, { name: 'TableColumnMenuModule', moduleSpecifier: '@rxap/material-table-system' });
      CoerceComponentImport(classDeclaration, { name: 'MatPaginatorModule', moduleSpecifier: '@angular/material/paginator' });
      CoerceComponentImport(classDeclaration, { name: 'MatSortModule', moduleSpecifier: '@angular/material/sort' });
      CoerceComponentImport(classDeclaration, { name: 'PersistentPaginatorDirective', moduleSpecifier: '@rxap/material-table-system' });
      CoerceComponentImport(classDeclaration, { name: 'DataSourceErrorComponent', moduleSpecifier: '@rxap/data-source' });
      CoerceComponentImport(classDeclaration, { name: 'MatDividerModule', moduleSpecifier: '@angular/material/divider' });
      CoerceComponentImport(classDeclaration, { name: 'TableDataSourceDirective', moduleSpecifier: '@rxap/material-table-system' });
      CoerceComponentImport(classDeclaration, { name: 'MatTableModule', moduleSpecifier: '@angular/material/table' });
      CoerceComponentImport(classDeclaration, { name: 'CardProgressBarDirective', moduleSpecifier: '@rxap/material-directives/card' });
      CoerceComponentImport(classDeclaration, { name: 'MatProgressBarModule', moduleSpecifier: '@angular/material/progress-bar' });
      CoerceComponentImport(classDeclaration, { name: 'MatCardModule', moduleSpecifier: '@angular/material/card' });
      CoerceComponentImport(classDeclaration, { name: 'AsyncPipe', moduleSpecifier: '@angular/common' });
      CoerceComponentImport(classDeclaration, { name: 'NgClass', moduleSpecifier: '@angular/common' });
      // region from column
      for (const column of columnList) {
        for (const componentImport of column.importList) {
          CoerceComponentImport(classDeclaration, componentImport);
        }
        for (const pipe of column.pipeList) {
          CoerceComponentImport(classDeclaration, pipe);
        }
      }
      if (columnList.some(column => column.hasFilter)) {
        CoerceComponentImport(classDeclaration, { name: 'TableFilterModule', moduleSpecifier: '@rxap/material-table-system' });
      }
      if (columnList.some(column => column.propertyPath.includes('.'))) {
        CoerceComponentImport(classDeclaration, { name: 'GetFromObjectPipe', moduleSpecifier: '@rxap/pipes' });
      }
      // endregion
      // region from action
      if (actionList && actionList.length) {
        CoerceComponentImport(classDeclaration, { name: 'MatButtonModule', moduleSpecifier: '@angular/material/button' });
        CoerceComponentImport(classDeclaration, { name: 'MatIconModule', moduleSpecifier: '@angular/material/icon' });
        CoerceComponentImport(classDeclaration, { name: 'TableRowActionsModule', moduleSpecifier: '@rxap/material-table-system' });
        if (actionList.some(action => action.confirm)) {
          CoerceComponentImport(classDeclaration, {
            name: 'ConfirmModule',
            moduleSpecifier: '@rxap/components'
          });
        }
        if (actionList.some(action => action.permission)) {
          CoerceComponentImport(classDeclaration, {
            name: 'HasPermissionModule',
            moduleSpecifier: '@rxap/authorization'
          });
        }
        if (actionList.some(action => action.errorMessage || action.successMessage)) {
          CoerceComponentImport(classDeclaration, {
            name: 'MatSnackBarModule',
            moduleSpecifier: '@angular/material/snack-bar'
          });
        }
      }
      // endregion
      if (headerButton) {
        CoerceComponentImport(classDeclaration, { name: 'MatButtonModule', moduleSpecifier: '@angular/material/button' });
        CoerceComponentImport(classDeclaration, { name: 'TableHeaderButtonDirective', moduleSpecifier: '@rxap/material-table-system' });
      }
      if (modifiers.includes(TableModifiers.SHOW_ARCHIVED_SLIDE)) {
        CoerceComponentImport(classDeclaration, { name: 'TableShowArchivedSlideComponent', moduleSpecifier: '@rxap/material-table-system' });
      }
      if (modifiers.includes(TableModifiers.NAVIGATION_BACK_HEADER)) {
        CoerceComponentImport(classDeclaration, { name: 'NavigateBackButtonComponent', moduleSpecifier: '@rxap/components' });
      }
      // endregion

      if (!!options.feature && (!options.directory || !options.directory.includes('/'))) {
        CoerceDefaultClassExport(classDeclaration, true);
      }

      tsMorphTransform(project, [sourceFile], [classDeclaration], options);
    }
  });

}
