import {
  chain,
  noop,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceImports,
  CoerceInterface,
  CoerceTypeAlias,
  OperationIdToResponseClassImportPath,
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
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
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
  controllerName: string;
}

export function NormalizeMinimumTableComponentOptions(
  options: Readonly<MinimumTableComponentOptions>,
): NormalizedMinimumTableComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  const normalizedTableOptions = NormalizeMinimumTableOptions(options, name);
  const { componentName } = normalizedTableOptions;
  const nestModule = options.nestModule ?? null;
  return Object.seal({
    ...normalizedAngularOptions,
    ...normalizedTableOptions,
    nestModule,
    controllerName: BuildNestControllerName({
      controllerName: componentName,
      nestModule,
    }),
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
      CoerceImports(sourceFile, {
        moduleSpecifier: OperationIdToResponseClassImportPath(operationId),
        namedImports: [ OperationIdToResponseClassName(operationId) ],
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

  const {
    type,
    role,
  } = action;
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

  if (role !== 'operation') {
    throw new SchematicsException(`Invalid action role: ${ role } - expected operation`);
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
      context,
    }),
  ]);

}

function formActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    type,
    role,
  } = action;
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

  if (role !== 'form') {
    throw new SchematicsException(`Invalid action role: ${ role } - expected form`);
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
      context,
    }),
  ]);

}

function navigateActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    type,
    role,
  } = action;
  const {
    overwrite,
    project,
    feature,
    shared,
    backend,
    componentName,
    directory,
  } = normalizedOptions;

  if (![ 'link', 'navigate' ].includes(role ?? '')) {
    throw new SchematicsException(`Invalid action role: ${ role } - expected navigate`);
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

  const {
    type,
    role,
  } = action;
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

  if (role !== 'dialog') {
    throw new SchematicsException(`Invalid action role: ${ role } - expected dialog`);
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
      context,
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

  const rules: Rule[] = [];

  switch (action.role) {

    case 'operation':
      rules.push(operationActionRule(action, normalizedOptions));
      break;

    case 'form':
      rules.push(formActionRule(action, normalizedOptions));
      break;

    case 'link':
      console.warn('Deprecated action type: link - use navigate instead');
      rules.push(navigateActionRule(action, normalizedOptions));
      break;

    case 'navigate':
      rules.push(navigateActionRule(action, normalizedOptions));
      break;

    case 'dialog':
      rules.push(dialogActionRule(action, normalizedOptions));
      break;

    default:
      rules.push(defaultActionRule(action, normalizedOptions));

  }

  return chain(rules);

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
    name,
    project,
    feature,
    backend,
    shared,
    directory,
    context,
    nestModule,
    controllerName,
  } = normalizedOptions;
  if (headerButton) {
    const options = {
      tableName: name,
      project,
      feature,
      backend,
      shared,
      directory,
      ...headerButton,
    };
    switch (headerButton.role) {
      case 'form':
        return ExecuteSchematic('form-table-header-button', {
          ...options,
          context,
          // if the nest module is not defined, then use the controller name as the nest module name
          nestModule: nestModule ?? controllerName,
        });

      case 'navigation':
      case 'link':
        return ExecuteSchematic('navigation-table-header-button', options);

      default:
        return ExecuteSchematic('table-header-button', options);
    }
  }
  return noop();
}
