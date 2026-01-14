import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentImport,
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import { NormalizedTableComponentOptions } from './normalize-table-component-options';

export function selectColumnRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    selectColumn,
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
  } = normalizedOptions;

  if (selectColumn) {
    return chain([
      CoerceComponentRule({
        project,
        feature,
        shared,
        name: componentName,
        directory,
        overwrite,
        tsMorphTransform: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
          AddComponentProvider(
            sourceFile,
            'SelectRowService',
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'SelectRowService' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS',
              useValue: Writers.object({
                multiple: 'true',
              }),
            },
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS' ],
              },
            ],
          );
          AddComponentImport(sourceFile, 'SelectRowModule', '@rxap/material-table-system');
        },
      }),
    ]);
  }

  return noop();

}