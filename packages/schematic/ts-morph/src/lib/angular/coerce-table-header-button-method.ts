import { chain } from '@angular-devkit/schematics';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { AddComponentProvider } from './add-component-provider';
import {
  CoerceComponentOptions,
  CoerceComponentRule,
} from './coerce-component';
import {
  CoerceMethodClass,
  CoerceMethodClassOptions,
} from './coerce-method-class';

export interface CoerceTableHeaderButtonMethodOptions extends Omit<CoerceMethodClassOptions, 'name'> {
  tableName: string;
  tsMorphTransformComponent?: (
    project: Project,
    [ componentSourceFile ]: [ SourceFile ],
    [ componentClass ]: [ ClassDeclaration ],
    options: CoerceComponentOptions,
  ) => void;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string | null;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export function CoerceTableHeaderButtonMethodRule(options: CoerceTableHeaderButtonMethodOptions) {

  let {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    tsMorphTransformComponent,
    tableName,
    project,
    feature,
    shared,
    overwrite,
    directory,
    tsMorphTransform,
  } = options;

  tsMorphTransform ??= () => ({});
  tsMorphTransformComponent ??= () => ({});

  return chain([
    CoerceMethodClass({
      project,
      feature,
      shared,
      overwrite,
      directory: join(directory ?? '', 'methods'),
      name: 'header-button',
      tsMorphTransform: (project, sourceFile, classDeclaration) => {
        CoerceImports(sourceFile, [
          {
            moduleSpecifier: '@rxap/material-table-system',
            namedImports: [ 'TableHeaderButtonMethod' ],
          },
        ]);
        const buttonOptions: Record<string, string | WriterFunction> = {};
        if (refresh) {
          buttonOptions['refresh'] = 'true';
        }
        if (confirm) {
          buttonOptions['confirm'] = 'true';
        }
        if (tooltip) {
          buttonOptions['tooltip'] = `$localize\`${ tooltip }\``;
        }
        if (errorMessage) {
          buttonOptions['errorMessage'] = `$localize\`${ errorMessage }\``;
        }
        if (successMessage) {
          buttonOptions['successMessage'] = `$localize\`${ successMessage }\``;
        }
        CoerceDecorator(classDeclaration, 'TableHeaderButtonMethod', {
          arguments: [ Writers.object(buttonOptions) ],
        });
        return {
          ...tsMorphTransform!(project, sourceFile, classDeclaration),
        };
      },
    }),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: tableName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ sourceFile ]: [ SourceFile ],
        [ componentClass ]: [ ClassDeclaration ],
        options: CoerceComponentOptions,
      ) => {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'TABLE_HEADER_BUTTON_METHOD',
            useClass: 'HeaderButtonMethod',
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'TABLE_HEADER_BUTTON_METHOD' ],
            },
            {
              moduleSpecifier: './methods/header-button.method',
              namedImports: [ 'HeaderButtonMethod' ],
            },
          ],
        );
        tsMorphTransformComponent!(project, [ sourceFile ], [ componentClass ], options);
      },
    }),
  ]);

}
