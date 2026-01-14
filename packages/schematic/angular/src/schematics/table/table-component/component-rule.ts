import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceMinimumTableComponentRule,
  LoadCssClassHandlebarsTemplate,
  LoadMatColumnDefHandlebarsTemplate,
  LoadMatFormFieldHandlebarsTemplate,
  LoadPipeHandlebarsTemplate,
  TableModifiers,
} from '@rxap/schematic-angular';
import { AddComponentProvider } from '@rxap/schematics-ts-morph';
import { TypeImportToImportStructure } from '@rxap/ts-morph';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTableComponentOptions } from './normalize-table-component-options';

export function componentRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    directory,
    overwrite,
    modifiers,
    columnList,
    tableMethod,
    filterList,
    componentName,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    hasNavigationBackHeader: modifiers.includes(TableModifiers.NAVIGATION_BACK_HEADER),
    hasWithoutTitle: modifiers.includes(TableModifiers.WITHOUT_TITLE),
    hasFilter: filterList.length > 0 || columnList.some((c) => c.hasFilter),
    hasCustomFilter: filterList.length > 0,
    hasColumnWithFilter: columnList.some((c) => c.hasFilter),
    hasShowArchivedSlide: modifiers.includes(TableModifiers.SHOW_ARCHIVED_SLIDE),
    exportDefault: !!feature && !directory,
  };

  return chain([
    () => console.log(`Coerce the table component '${ componentName }'`),
    CoerceMinimumTableComponentRule({
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
      tsMorphTransform: (
        project: Project,
        [ componentSourceFile ]: [ SourceFile ],
      ) => {
        if (tableMethod) {
          AddComponentProvider(
            componentSourceFile,
            {
              provide: 'RXAP_TABLE_METHOD',
              useClass: tableMethod.name,
            },
            [
              TypeImportToImportStructure(tableMethod),
              {
                namedImports: [ 'RXAP_TABLE_METHOD' ],
                moduleSpecifier: '@rxap/material-table-system',
              },
            ],
          );
        }
      },
    }),
  ]);
}