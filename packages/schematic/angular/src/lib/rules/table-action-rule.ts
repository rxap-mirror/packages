// region table action
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { NormalizedMinimumTableComponentOptions } from '../normalize-minimum-table-component-options';
import { NormalizedTableAction } from '../table/table-action';
import { TableActionKind } from '../table/table-action-kind';

function operationActionRule(
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

  if (kind !== TableActionKind.OPERATION) {
    throw new Error(`Invalid action role: ${ kind } - expected operation`);
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
    context,
  } = normalizedOptions;

  let { controllerName } = normalizedOptions;

  controllerName = BuildNestControllerName({
    controllerName: controllerName,
    nestModule,
    controllerNameSuffix: CoerceSuffix(action.type, '-action'),
  });

  if (kind !== TableActionKind.FORM) {
    throw new Error(`Invalid action role: ${ kind } - expected form`);
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

  if (kind !== TableActionKind.NAVIGATION) {
    throw new Error(`Invalid action role: ${ kind } - expected navigation`);
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
    throw new Error(`Invalid action role: ${ kind } - expected dialog`);
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
    throw new Error(`Invalid action role: ${ kind } - expected open-api`);
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