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
  RequiresTypeImport,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  IsRecord,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ImportDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  Writers,
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
import { NormalizedDataProperty } from '@rxap/ts-morph';

export type MinimumTableComponentOptions = MinimumTableOptions & AngularOptions;

export interface NormalizedMinimumTableComponentOptions
  extends Omit<Readonly<Normalized<MinimumTableComponentOptions> & NormalizedMinimumTableOptions & NormalizedAngularOptions>, 'columnList' | 'actionList' | 'propertyList'> {
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
  componentName: string;
  controllerName: string;
}

export function NormalizeMinimumTableComponentOptions(
  options: Readonly<MinimumTableComponentOptions>,
  suffix = '-table',
): NormalizedMinimumTableComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  const normalizedTableOptions = NormalizeMinimumTableOptions(options, name, suffix);
  const { componentName } = normalizedTableOptions;
  const nestModule = options.nestModule ?? null;
  return Object.freeze({
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
        // TODO : support the option to specify how to get the row type from the operation response type
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

function tablePropertyListToImportStructure(propertyList: ReadonlyArray<NormalizedDataProperty>): ReadonlyArray<OptionalKind<ImportDeclarationStructure>> {
  return propertyList.filter(p => RequiresTypeImport(p.type)).map(p => TypeImportToImportStructure(p.type));
}

function tablePropertyListToPropertiesStructure(propertyList: ReadonlyArray<NormalizedDataProperty>): OptionalKind<PropertySignatureStructure>[] {
  const result: any = {};

  propertyList.forEach((column) => {
    const parts = column.name.split('.');
    if (parts.length === 1) {
      result[column.name] = column.type.name;
    } else {
      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const part = parts[i];
        if (isLast) {
          current[part] = column.type.name ?? 'unknown';
        } else {
          current[part] = current[part] ?? {};
          current = current[part];
        }
      }
    }
  });

  // Convert the result object into the desired output format
  return Object.entries(result).map(([ name, type ]) => {
    if (IsRecord(type)) {
      return { name, type: Writers.object(type) };
    } else {
      return { name, type: type as string };
    }
  });
}


function tableInterfaceFromPropertyListRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    propertyList,
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
        properties: tablePropertyListToPropertiesStructure(propertyList),
      });
      CoerceImports(sourceFile, tablePropertyListToImportStructure(propertyList));
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
    // TODO : add support for the open-api backend type - this will require some why to define how to get the row type from the operation response type
    default:
    case BackendTypes.NONE:
      return tableInterfaceFromPropertyListRule(normalizedOptions);
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
    options: additionalOptions,
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
      ...additionalOptions,
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (
          shared ? undefined : nestModule
        ) ?? controllerName,
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
    options: additionalOptions,
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
      ...additionalOptions,
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (
          shared ? undefined : nestModule
        ) ?? controllerName,
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
    options: additionalOptions,
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

  if (![ 'link', 'navigate', 'navigation' ].includes(role ?? '')) {
    throw new SchematicsException(`Invalid action role: ${ role } - expected navigation`);
  }

  return chain([
    () =>
      console.log(`Coerce navigate table action '${ action.type }'`),
    ExecuteSchematic('navigation-table-action', {
      ...additionalOptions,
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
    options: additionalOptions,
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
      ...additionalOptions,
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule:
        (
          shared ? undefined : nestModule
        ) ?? controllerName,
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

  const { options: additionalOptions } = action;

  return chain([
    () => console.log(`Coerce table action '${ action.type }'`),
    ExecuteSchematic('table-action', {
      ...additionalOptions,
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

function openApiActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    options: additionalOptions,
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

  if (role !== 'open-api') {
    throw new SchematicsException(`Invalid action role: ${ role } - expected open-api`);
  }

  return chain([
    () => console.log(`Coerce open api table action '${ action.type }'`),
    ExecuteSchematic('open-api-table-action', {
      ...additionalOptions,
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

    case 'navigation':
      rules.push(navigateActionRule(action, normalizedOptions));
      break;

    case 'dialog':
      rules.push(dialogActionRule(action, normalizedOptions));
      break;

    case 'open-api':
      rules.push(openApiActionRule(action, normalizedOptions));
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
  if (columnList.some(c => c.role === 'component')) {

    return chain([
      () => console.log(
        `Coerce the table cell components count: ${
          columnList.filter((column) => column.role === 'component').length
        }`,
      ),
      ...columnList
        .filter((column) => column.role === 'component')
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
      ...headerButton.options ?? {},
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
