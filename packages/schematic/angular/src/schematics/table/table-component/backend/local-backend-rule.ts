import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceMethodClass,
} from '@rxap/schematics-ts-morph';
import { CoerceImports } from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTableComponentOptions } from '../normalize-table-component-options';

export function localBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    name,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce local backend method to table component`),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ componentSourceFile ]: [ SourceFile ],
      ) => {
        AddComponentProvider(
          componentSourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: `${ classify(name) }TableMethod`,
          },
          [
            {
              namedImports: [ `${ classify(name) }TableMethod` ],
              moduleSpecifier: `./${ name }-table.method`,
            },
            {
              namedImports: [ 'RXAP_TABLE_METHOD' ],
              moduleSpecifier: '@rxap/material-table-system',
            },
          ],
        );
      },
    }),
    () => console.log(`Coerce local backend method`),
    CoerceMethodClass({
      name: `${ name }-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: '@rxap/data-source/table',
            namedImports: [ 'TableEvent' ],
          },
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [
            {
              name: 'event',
              type: 'TableEvent',
            },
          ],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
  ]);

}