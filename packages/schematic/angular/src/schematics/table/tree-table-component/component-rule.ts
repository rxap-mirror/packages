import { chain } from '@angular-devkit/schematics';
import {
  CoerceTreeTableComponentRule,
  LoadCssClassHandlebarsTemplate,
  LoadMatColumnDefHandlebarsTemplate,
  LoadMatFormFieldHandlebarsTemplate,
  LoadPipeHandlebarsTemplate,
  TreeTableModifiers,
} from '@rxap/schematic-angular';
import { AddComponentProvider } from '@rxap/schematics-ts-morph';
import { NormalizedTreeTableComponentOptions } from './normalized-tree-table-component-options';

export function componentRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

  const {
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    modifiers,
    columnList,
    filterList,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    hasNavigationBackHeader: modifiers.includes(TreeTableModifiers.NAVIGATION_BACK_HEADER),
    hasWithoutTitle: modifiers.includes(TreeTableModifiers.WITHOUT_TITLE),
    hasFilter: filterList.length > 0 || columnList.some((c) => c.hasFilter),
    hasCustomFilter: filterList.length > 0,
    hasColumnWithFilter: columnList.some((c) => c.hasFilter),
    exportDefault: !!feature && !directory,
  };

  return chain([
    () => console.log(`Coerce the table component ${ componentName }`),
    CoerceTreeTableComponentRule({
      table: normalizedOptions,
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: templateOptions,
      },
      handlebars: {
        partials: {
          matFormField: LoadMatFormFieldHandlebarsTemplate(),
          pipe: LoadPipeHandlebarsTemplate(),
          cssClass: LoadCssClassHandlebarsTemplate(),
          matColumnDef: LoadMatColumnDefHandlebarsTemplate(),
        },
      },
      tsMorphTransform: (project, [ sourceFile ]) => {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'TABLE_DATA_SOURCE',
            useClass: 'TreeTableDataSource',
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'TreeTableDataSource' ],
            },
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'TABLE_DATA_SOURCE' ],
            },
          ],
        );
      },
    }),
  ]);

}