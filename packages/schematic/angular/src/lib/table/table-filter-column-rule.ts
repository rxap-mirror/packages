import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedAngularOptions } from '../angular-options';
import { NormalizedMinimumTableOptions } from '../minimum-table-options';
import { UsePickFromTableInterfaceAsFormTypeRule } from '../use-pick-from-table-interface-as-form-type';

/**
 * Applies table filter column rule.
 *
 * @param {NormalizedMinimumTableOptions & NormalizedAngularOptions & { name: string }} normalizedOptions - The normalized options object.
 * @param {string} [suffix] - The optional suffix string for the file name of the table interface.
 * @returns {Rule} - The rule function.
 */
export function TableFilterColumnRule(normalizedOptions: NormalizedMinimumTableOptions & NormalizedAngularOptions & { name: string }, suffix?: string): Rule {
  const {
    columnList,
    project,
    feature,
    shared,
    directory,
    backend,
    overwrite,
    componentName,
    controllerName,
    nestModule,
    name,
  } = normalizedOptions;
  if (columnList.some((c) => c.hasFilter)) {
    return chain([
      () => console.log(`Coerce the filter form definition`),
      ExecuteSchematic('form-definition', {
        name: CoerceSuffix(componentName, '-filter'),
        project,
        feature,
        shared,
        directory,
        controllerName,
        nestModule,
        backend,
        overwrite,
        controlList: columnList
          .filter((column) => column.filterControl)
          .map(column => column.filterControl),
      }),
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
            'FormProviders',
            [
              {
                moduleSpecifier: './form.providers',
                namedImports: [ 'FormProviders' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            'TableFilterService',
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'TableFilterService' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_TABLE_FILTER_FORM_DEFINITION',
              useFactory: 'FormFactory',
              deps: [ 'INJECTOR' ],
            },
            [
              {
                moduleSpecifier: '@angular/core',
                namedImports: [ 'INJECTOR' ],
              },
              {
                moduleSpecifier: './form.providers',
                namedImports: [ 'FormFactory' ],
              },
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'RXAP_TABLE_FILTER_FORM_DEFINITION' ],
              },
            ],
          );
        },
      }),
      UsePickFromTableInterfaceAsFormTypeRule({
        name,
        columnList,
        feature,
        project,
        shared,
        directory,
        suffix,
        formName: CoerceSuffix(componentName, '-filter'),
      }),
    ]);
  }

  return noop();
}
