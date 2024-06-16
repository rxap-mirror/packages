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
  CoerceComponentInput,
  CoerceImports,
  NormalizedDataProperty,
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
import { NormalizedTableAction } from './table/table-action';
import { TableActionKind } from './table/table-action-kind';
import { TableColumnKind } from './table/table-column-kind';
import { TableColumnModifier } from './table/table-column-modifier';

export type MinimumTableComponentOptions = MinimumTableOptions & AngularOptions;

export interface NormalizedMinimumTableComponentOptions
  extends Readonly<Normalized<Omit<MinimumTableComponentOptions, keyof AngularOptions | keyof MinimumTableOptions>> & NormalizedMinimumTableOptions & NormalizedAngularOptions> {
  componentName: string;
  controllerName: string;
}

export function NormalizeMinimumTableComponentOptions<MODIFIER extends string = string>(
  options: Readonly<MinimumTableComponentOptions>,
  isModifier: (value: string) => value is MODIFIER,
  suffix: string,
): NormalizedMinimumTableComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name, controllerName } = normalizedAngularOptions;
  let { nestModule } = normalizedAngularOptions;
  const normalizedTableOptions = NormalizeMinimumTableOptions(options, name, isModifier, suffix);
  const { componentName } = normalizedTableOptions;
  nestModule ??= componentName;
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableOptions,
    nestModule,
    controllerName: controllerName ?? BuildNestControllerName({
      controllerName: componentName,
      nestModule,
    }),
    directory: join(options.directory ?? '', componentName),
  });
}

// region table interface

function tableInterfaceFromOpenApiRule(normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
  const {
    backend,
    project,
    feature,
    directory,
    shared,
    componentName,
  } = normalizedOptions;
  const { operationName = 'get-page', typePath = `['rows'][number]` } = options;
  if (![ BackendTypes.NESTJS ].includes(backend.kind)) {
    throw new SchematicsException(`Invalid backend type: ${ backend } - expected nestjs`);
  }
  const operationId = buildOperationId(
    normalizedOptions,
    operationName,
    BuildNestControllerName(normalizedOptions),
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
        type: `TableRowMetadata & ${ OperationIdToResponseClassName(operationId) }${typePath}`,
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


function tableInterfaceFromPropertyListRule(normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
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
      CoerceImports(sourceFile, tablePropertyListToImportStructure(propertyList) as any[]);
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'TableRowMetadata' ],
      });
    }, [ `${ dasherize(componentName) }.ts?` ]),
  ]);

}

export interface TableInterfaceRuleOptions {
  /**
   * the name of the operation to get a table page. defaults to 'get-page' and is only used when the backend is nestjs
   */
  operationName?: string;
  /**
   * the path to the row type in the operation response type. defaults to `['rows'][number]` and is only used when the backend is nestjs
   */
  typePath?: string;
}

export function tableInterfaceRule(normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
  const { backend } = normalizedOptions;
  switch (backend.kind) {
    case BackendTypes.NESTJS:
      return tableInterfaceFromOpenApiRule(normalizedOptions, options);
    // TODO : add support for the open-api backend type - this will require some why to define how to get the row type from the operation response type
    default:
    case BackendTypes.NONE:
      return tableInterfaceFromPropertyListRule(normalizedOptions, options);
  }
}

// endregion

// region table action
function operationActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    kind
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

  if (kind !== TableActionKind.OPERATION) {
    throw new SchematicsException(`Invalid action role: ${ kind } - expected operation`);
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
      nestModule,
      context,
      controllerName,
    }),
  ]);

}

function formActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    kind
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
    context,
  } = normalizedOptions;

  let { controllerName } = normalizedOptions;

  controllerName = BuildNestControllerName({
    controllerName: controllerName,
    nestModule,
    controllerNameSuffix: CoerceSuffix(action.type, '-action'),
  });

  if (kind !== TableActionKind.FORM) {
    throw new SchematicsException(`Invalid action role: ${ kind } - expected form`);
  }

  return chain([
    () => console.log(`Coerce form table action '${ action.type }' - '${ controllerName }'`),
    ExecuteSchematic('form-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule,
      controllerName,
      context,
    }),
  ]);

}

function navigateActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    kind
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

  if (kind !== TableActionKind.NAVIGATION) {
    throw new SchematicsException(`Invalid action role: ${ kind } - expected navigation`);
  }

  return chain([
    () =>
      console.log(`Coerce navigate table action '${ action.type }'`),
    ExecuteSchematic('navigation-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule,
      controllerName,
      context,
    }),
  ]);

}

function dialogActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    kind,
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

  if (kind !== TableActionKind.DIALOG) {
    throw new SchematicsException(`Invalid action role: ${ kind } - expected dialog`);
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
      nestModule,
      controllerName,
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
    nestModule,
    controllerName,
    context,
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
      nestModule,
      controllerName,
      context,
    }),
  ]);

}

function openApiActionRule(
  action: NormalizedTableAction,
  normalizedOptions: NormalizedMinimumTableComponentOptions,
): Rule {

  const {
    kind,
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

  if (kind !== TableActionKind.OPEN_API) {
    throw new SchematicsException(`Invalid action role: ${ kind } - expected open-api`);
  }

  return chain([
    () => console.log(`Coerce open api table action '${ action.type }'`),
    ExecuteSchematic('open-api-table-action', {
      ...action,
      overwrite,
      project,
      feature,
      shared,
      backend,
      tableName: componentName,
      directory,
      nestModule,
      controllerName,
      context,
    }),
  ]);

}

function actionRule(action: NormalizedTableAction, normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {

  const rules: Rule[] = [];

  switch (action.kind) {

    case TableActionKind.OPERATION:
      rules.push(operationActionRule(action, normalizedOptions));
      break;

    case TableActionKind.FORM:
      rules.push(formActionRule(action, normalizedOptions));
      break;

    case TableActionKind.NAVIGATION:
      rules.push(navigateActionRule(action, normalizedOptions));
      break;

    case TableActionKind.DIALOG:
      rules.push(dialogActionRule(action, normalizedOptions));
      break;

    case TableActionKind.OPEN_API:
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
    componentName,
  } = normalizedOptions;
  if (columnList.some(column => column.kind === TableColumnKind.COMPONENT)) {

    return chain([
      () => console.log(
        `Coerce the table cell components count: ${
          columnList.filter((column) => column.kind === TableColumnKind.COMPONENT).length
        }`,
      ),
      ...columnList
        .filter((column) => column.kind ===TableColumnKind.COMPONENT)
        .map((column) =>
          CoerceComponentRule({
            project,
            feature,
            shared,
            name: CoerceSuffix(dasherize(column.name), '-cell'),
            componentOptions: {
              selector: `td[mat-cell][{{prefix}}-${ dasherize(column.name) }-cell]`,
            },
            directory,
            overwrite: overwrite || column.modifiers.includes(TableColumnModifier.OVERWRITE),
            tsMorphTransform: (project, [ sourceFile ], [classDeclaration]) => {
              CoerceComponentInput(classDeclaration, 'element', {
                name: `I${ classify(componentName) }`,
                moduleSpecifier: `../${ dasherize(componentName) }`,
              }, { isRequired: true });
              CoerceComponentInput(classDeclaration, 'value', column.type, { isRequired: true });
            }
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
    backend,
    shared,
    directory,
    context,
    nestModule,
    controllerName,
    componentName,
  } = normalizedOptions;
  if (headerButton) {
    const options = {
      ...headerButton.options ?? {},
      // it is required to use the componentName. The componentName has already the proper suffix '-tree-table'
      // if the name property is used then the wrong suffix '-table' will be used
      tableName: componentName,
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
