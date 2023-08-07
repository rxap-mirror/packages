import {
  chain,
  noop,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceImports,
  CoerceInterface,
  CoerceMethodClass,
  CoerceParameterDeclaration,
  CoerceStatements,
  CoerceTypeAlias,
  OperationIdToResponseClassName,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  classify,
  dasherize,
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
} from './angular-options';
import { BackendTypes } from './backend-types';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import { NormalizedTableAction } from './table-action';
import { NormalizedTableColumn } from './table-column';

export type MinimumTableComponentOptions = MinimumTableOptions & AngularOptions;

export interface NormalizedMinimumTableComponentOptions
  extends Readonly<Normalized<MinimumTableComponentOptions> & NormalizedMinimumTableOptions & NormalizedAngularOptions> {
  columnList: NormalizedTableColumn[];
  actionList: NormalizedTableAction[];
  componentName: string;
}

export function NormalizeMinimumTableComponentOptions(
  options: Readonly<MinimumTableComponentOptions>,
): NormalizedMinimumTableComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  const normalizedTableOptions = NormalizeMinimumTableOptions(options, name);
  const componentName = CoerceSuffix(name, '-table');
  return Object.seal({
    ...normalizedAngularOptions,
    ...normalizedTableOptions,
    componentName,
    directory: join(options.directory ?? '', componentName),
  });
}

// region table interface

function tableInterfaceFromOpenApiRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    backend,
    project,
    feature,
    directory,
    shared,
    componentName,
    nestModule,
  } = normalizedOptions;
  if (![ BackendTypes.NESTJS ].includes(backend)) {
    throw new SchematicsException(`Invalid backend type: ${ backend } - expected nestjs`);
  }
  const controllerName = BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  const operationId = buildOperationId(
    normalizedOptions,
    'get-page',
    controllerName,
  );
  return chain([
    TsMorphAngularProjectTransformRule({
      project,
      feature,
      directory,
      shared,
    }, (project, [ sourceFile ]) => {
      CoerceTypeAlias(sourceFile, `I${ classify(componentName) }`).set({
        isExported: true,
        type: `TableRowMetadata & ${ OperationIdToResponseClassName(operationId) }['rows'][number]`,
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'TableRowMetadata' ],
      });
    }, [ `${ dasherize(componentName) }.ts?` ]),
  ]);
}

function tableInterfaceFromColumnListRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    columnList,
    name,
    componentName,
    project,
    feature,
    directory,
    shared,
  } = normalizedOptions;

  return chain([
    TsMorphAngularProjectTransformRule({
      project,
      feature,
      directory,
      shared,
    }, (project, [ sourceFile ]) => {
      CoerceInterface(sourceFile, `I${ classify(componentName) }`).set({
        isExported: true,
        extends: [ 'Record<string, unknown>', 'TableRowMetadata' ],
        properties: columnList.map((column) => ({
          name: column.name,
          type: column.type ?? 'unknown',
        })),
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'TableRowMetadata' ],
      });
    }, [ `${ dasherize(componentName) }.ts?` ]),
  ]);

}

export function tableInterfaceRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const { backend } = normalizedOptions;
  switch (backend) {
    case BackendTypes.NESTJS:
      return tableInterfaceFromOpenApiRule(normalizedOptions);
    default:
    case BackendTypes.NONE:
      return tableInterfaceFromColumnListRule(normalizedOptions);
  }
}

// endregion

// region table action
function operationActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const { type } = action;
  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
    nestModule,
    controllerName,
    context,
  } = normalizedOptions;

  if (type !== 'operation') {
    throw new SchematicsException(`Invalid action type: ${ action.type } - expected operation`);
  }

  return chain([
    () =>
      console.log(`Coerce operation table action '${ action.type }'`),
    ExecuteSchematic('operation-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (shared ? undefined : nestModule) ?? controllerName,
      context: joinWithDash([ context, controllerName ]),
    }),
  ]);

}

function formActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const { type } = action;
  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
    nestModule,
    controllerName,
    context,
  } = normalizedOptions;

  if (type !== 'form') {
    throw new SchematicsException(`Invalid action type: ${ action.type } - expected form`);
  }

  return chain([
    () => console.log(`Coerce form table action '${ action.type }'`),
    ExecuteSchematic('form-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (shared ? undefined : nestModule) ?? controllerName,
      context: joinWithDash([ context, controllerName ]),
    }),
  ]);

}

function navigateActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const { type } = action;
  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
  } = normalizedOptions;

  if (![ 'link', 'navigate' ].includes(type)) {
    throw new SchematicsException(`Invalid action type: ${ action.type } - expected navigate`);
  }

  return chain([
    () =>
      console.log(`Coerce navigate table action '${ action.type }'`),
    ExecuteSchematic('navigate-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
    }),
  ]);

}

function dialogActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const { type } = action;
  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
    nestModule,
    controllerName,
    context,
  } = normalizedOptions;

  if (type !== 'dialog') {
    throw new SchematicsException(`Invalid action type: ${ action.type } - expected dialog`);
  }

  return chain([
    () =>
      console.log(`Coerce dialog table action '${ action.type }'`),
    ExecuteSchematic('dialog-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (shared ? undefined : nestModule) ?? controllerName,
      context: joinWithDash([ context, controllerName ]),
    }),
  ]);

}

function defaultActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce table action '${ action.type }'`),
    ExecuteSchematic('table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
    }),
  ]);

}

function actionRule(action: NormalizedTableAction, normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {

  switch (action.role) {

    case 'operation':
      return operationActionRule(action, normalizedOptions);

    case 'form':
      return formActionRule(action, normalizedOptions);

    case 'link':
      console.warn('Deprecated action type: link - use navigate instead');
      return navigateActionRule(action, normalizedOptions);

    case 'navigate':
      return navigateActionRule(action, normalizedOptions);

    case 'dialog':
      return dialogActionRule(action, normalizedOptions);

    case 'method':
      console.warn('Deprecated action type: method - leaf empty instead');
      return defaultActionRule(action, normalizedOptions);

    default:
      return defaultActionRule(action, normalizedOptions);

  }

}

export function actionListRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const { actionList } = normalizedOptions;
  if (actionList.length > 0) {
    return chain([
      () => console.log(`Coerce the table actions count: ${ actionList.length }`),
      ...actionList.map((action) => actionRule(action, normalizedOptions)),
    ]);
  }
  return noop();
}

// endregion

export function cellComponentRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    overwrite,
    columnList,
    project,
    feature,
    shared,
    directory,
  } = normalizedOptions;
  if (columnList.some(c => c.type === 'component')) {

    return chain([
      () => console.log(
        `Coerce the table cell components count: ${
          columnList.filter((column) => column.type === 'component').length
        }`,
      ),
      ...columnList
        .filter((column) => column.type === 'component')
        .map((column) =>
          CoerceComponentRule({
            project,
            feature,
            shared,
            name: CoerceSuffix(column.name, '-cell'),
            directory,
            overwrite: overwrite || column.modifiers.includes('overwrite'),
          }),
        ),
    ]);

  }

  return noop();
}

export function headerButtonRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    headerButton,
    project,
    feature,
    directory,
    shared,
    nestModule,
    controllerName,
    context,
    backend,
    overwrite,
    componentName,
  } = normalizedOptions;
  if (headerButton) {
    switch (headerButton.role) {
      case 'form':
        return chain([
          () => console.log(`Coerce the form for the create button`),
          ExecuteSchematic('form-component', {
            project,
            name: `table-header-button`,
            feature,
            directory,
            shared,
            window: true,
            controlList: [],
            nestModule: (shared ? undefined : nestModule) ?? controllerName,
            context: joinWithDash([ context, controllerName ]),
            backend,
            overwrite,
          }),
          CoerceMethodClass({
            project,
            feature,
            shared,
            directory: join(directory ?? '', 'methods'),
            name: 'table-header-button',
            overwrite,
            tsMorphTransform: (project, sourceFile, classDeclaration) => {
              const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
              CoerceParameterDeclaration(constructorDeclaration, 'formWindowService', {
                type: 'FormWindowService',
              });
              CoerceParameterDeclaration(constructorDeclaration, 'injector', {
                type: 'Injector',
                decorators: [
                  {
                    name: 'Inject',
                    arguments: [ 'INJECTOR' ],
                  },
                ],
              });
              CoerceParameterDeclaration(constructorDeclaration, 'defaultOptions', {
                type: 'FormWindowOptions<ITableHeaderButtonForm> | null',
                initializer: 'null',
                decorators: [
                  {
                    name: 'Inject',
                    arguments: [ 'RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS' ],
                  },
                  {
                    name: 'Optional',
                    arguments: [],
                  },
                ],
              });
              CoerceImports(sourceFile, [
                {
                  moduleSpecifier: '@angular/core',
                  namedImports: [ 'Injector', 'INJECTOR', 'Inject', 'Optional' ],
                },
                {
                  moduleSpecifier: '@rxap/form-window-system',
                  namedImports: [
                    'FormWindowOptions',
                    'FormWindowService',
                    'OpenFormWindowMethod',
                    'RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS',
                  ],
                },
                {
                  moduleSpecifier: '../table-header-button-form/table-header-button.form',
                  namedImports: [ 'ITableHeaderButtonForm', 'TableHeaderButtonForm' ],
                },
                {
                  moduleSpecifier: '../table-header-button-form/table-header-button-form.component',
                  namedImports: [ 'TableHeaderButtonFormComponent' ],
                },
              ]);
              CoerceStatements(constructorDeclaration, [
                'super(',
                'formWindowService,',
                'TableHeaderButtonForm,',
                'injector,',
                'TableHeaderButtonFormComponent,',
                'defaultOptions,',
                ');',
              ]);
              classDeclaration.setExtends('OpenFormWindowMethod<ITableHeaderButtonForm>');
              return {
                hasOverrideKeyword: true,
                statements: [ 'super.call(parameters);' ],
              };
            },
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
                {
                  provide: 'TABLE_CREATE_REMOTE_METHOD',
                  useClass: 'TableHeaderButtonMethod',
                },
                [
                  {
                    moduleSpecifier: '@rxap/material-table-system',
                    namedImports: [ 'TABLE_CREATE_REMOTE_METHOD' ],
                  },
                  {
                    moduleSpecifier: './methods/table-header-button.method',
                    namedImports: [ 'TableHeaderButtonMethod' ],
                  },
                ],
              );
            },
          }),
        ]);

      default:
        throw new SchematicsException(`Unknown header button role ${ headerButton.role }`);
    }
  }
  return noop();
}
