import { chain } from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceImports,
  CoerceMethodClass,
} from '@rxap/schematics-ts-morph';
import { classify } from '@rxap/utilities';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTreeTableComponentOptions } from '../normalized-tree-table-component-options';

export function localBackendRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

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
          {
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD',
            useClass: `${ classify(name) }RootTableMethod`,
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD' ],
            },
            {
              moduleSpecifier: `./${ name }-root-table.method`,
              namedImports: [ `${ classify(name) }RootTableMethod` ],
            },
          ],
        );
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD',
            useClass: `${ classify(name) }ChildTableMethod`,
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD' ],
            },
            {
              moduleSpecifier: `./${ name }-child-table.method`,
              namedImports: [ `${ classify(name) }ChildTableMethod` ],
            },
          ],
        );
      },
    }),
    () => console.log(`Coerce local backend root method`),
    CoerceMethodClass({
      name: `${ name }-root-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
    () => console.log(`Coerce local backend child method`),
    CoerceMethodClass({
      name: `${ name }-child-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: '@rxap/data-structure-tree',
            namedImports: [ 'Node' ],
          },
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [
            {
              name: 'node',
              type: `Node<I${ classify(name) }Table>`,
            },
          ],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
  ]);

}