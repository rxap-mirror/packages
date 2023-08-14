import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  CoerceClassConstructor,
  CoerceImports,
  CoerceParameterDeclaration,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { NormalizedTableHeaderButton } from '../../../../lib/table-header-button';
import { NormalizeTableHeaderButtonOptions } from '../../table-header-button/index';
import { FormTableHeaderButtonOptions } from './schema';

export interface NormalizedFormTableHeaderButtonOptions
  extends Readonly<Normalized<FormTableHeaderButtonOptions> & NormalizedAngularOptions & NormalizedTableHeaderButton> {
  options: Record<string, any>;
  controllerName: string;
}

export function NormalizeFormTableHeaderButtonOptions(
  options: Readonly<FormTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedTableHeaderButtonOptions = NormalizeTableHeaderButtonOptions(options);
  const nestModule = options.nestModule;
  return Object.seal({
    ...normalizedTableHeaderButtonOptions,
    context: options.context,
    nestModule,
    controllerName: BuildNestControllerName({
      nestModule,
      controllerName: 'header-button',
    }),
  });
}

function printOptions(options: NormalizedFormTableHeaderButtonOptions) {
  PrintAngularOptions('table-header-button', options);
}

export default function (options: FormTableHeaderButtonOptions) {
  const normalizedOptions = NormalizeFormTableHeaderButtonOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    tableName,
    project,
    feature,
    shared,
    directory,
    overwrite,
    options: formOptions,
    context,
    backend,
    nestModule,
    controllerName,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-header-button]\x1b[0m'),
      () => console.log('Coerce table header button form ...'),
      ExecuteSchematic('form-component', {
        ...formOptions,
        project,
        name: `table-header-button`,
        feature,
        directory,
        shared,
        window: true,
        nestModule,
        controllerName,
        context,
        backend,
        overwrite,
      }),
      () => console.log('Coerce table header button method ...'),
      CoerceTableHeaderButtonMethodRule({
        project,
        feature,
        shared,
        directory,
        overwrite,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
        tsMorphTransform: (project, sourceFile, classDeclaration) => {
          const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
          CoerceParameterDeclaration(constructorDeclaration, 'openWindowMethod', {
            isReadonly: true,
            scope: Scope.Private,
            type: 'OpenTableHeaderButtonFormWindowMethod',
          });
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: '../table-header-button-form/open-table-header-button-form-window.method',
              namedImports: [ 'OpenTableHeaderButtonFormWindowMethod' ],
            },
          ]);
          return {
            statements: [ 'return this.openWindowMethod.call(parameters).toPromise();' ],
          };
        },
        tsMorphTransformComponent: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
          AddComponentProvider(
            sourceFile,
            'OpenTableHeaderButtonFormWindowMethod',
            [
              {
                moduleSpecifier: './table-header-button-form/open-table-header-button-form-window.method',
                namedImports: [ 'OpenTableHeaderButtonFormWindowMethod' ],
              },
            ],
          );
        },
      }),
      () => console.groupEnd(),
    ]);
  };
}
