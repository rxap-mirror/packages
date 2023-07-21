import {
  TableAction,
  TableColumn,
  TableComponentOptions,
  TableHeaderButton,
} from './schema';
import {
  chain,
  noop,
  schematic,
  Tree,
} from '@angular-devkit/schematics';
import {
  camelize,
  capitalize,
  CoerceFile,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  BuildAngularBasePath,
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceGetPageOperation,
  GetPageOperationColumn,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/schematics-ts-morph';
import { FormDefinitionControl } from '../form-definition/schema';
import { NormalizeTableRowAction } from '../table-action';
import {
  DeleteEmptyProperties,
  joinWithDash,
} from '@rxap/utilities';

export interface NormalizedTableComponentOptions
  extends Required<TableComponentOptions> {
  actionList: Array<Required<TableAction>>;
  columnList: Array<Required<TableColumn>>;
  project: string;
  componentName: string;
  headerButton: TableHeaderButton | null;
  controllerName: string;
  nestModule: string | undefined;
}

export function NormalizeTableAction(
  tableAction: TableAction | string,
): Required<TableAction> {
  let type: string;
  let checkFunction: string;
  let tooltip: string;
  let errorMessage: string;
  let successMessage: string;
  let refresh = false;
  let confirm = false;
  let priority: number;
  let role: string;
  let icon: string | null = null;
  let svgIcon: string | null = null;
  let permission: string | null = null;
  let inHeader = false;
  if (typeof tableAction === 'string') {
    // type:role:modifier1,modifier2
    // edit:form:refresh,confirm
    const fragments = tableAction.split(':');
    type = fragments[0];
    role = fragments[1];
    if (fragments[2]) {
      const modifiers = fragments[2].split(/,(?![^(]*\))/g);
      refresh = modifiers.includes('refresh');
      confirm = modifiers.includes('confirm');
      inHeader = modifiers.includes('header');
      if (modifiers.some((m) => m.match(/icon\(.+\)/))) {
        icon = modifiers
          .find((m) => m.match(/icon\(.+\)/))
          .replace(/^icon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/svgIcon\(.+\)/))) {
        svgIcon = modifiers
          .find((m) => m.match(/svgIcon\(.+\)/))
          .replace(/^svgIcon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/permission\(.+\)/))) {
        permission = modifiers
          .find((m) => m.match(/permission\(.+\)/))
          .replace(/^permission\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/checkFunction\(.+\)/))) {
        checkFunction = modifiers
          .find((m) => m.match(/checkFunction\(.+\)/))
          .replace(/^checkFunction\(/, '')
          .replace(/\)$/, '');
      }
    }
  } else {
    type = tableAction.type;
    checkFunction = tableAction.checkFunction;
    tooltip = tableAction.tooltip;
    errorMessage = tableAction.errorMessage;
    successMessage = tableAction.successMessage;
    refresh = tableAction.refresh;
    confirm = tableAction.confirm;
    priority = tableAction.priority;
    role = tableAction.role;
    inHeader = tableAction.inHeader;
  }
  return {
    ...NormalizeTableRowAction({
      type,
      checkFunction,
      tooltip,
      errorMessage,
      successMessage,
      refresh,
      confirm,
      priority,
      inHeader,
    }),
    role,
    icon,
    svgIcon,
    permission,
  };
}

export function NormalizeTableActionList(
  tableActionList?: Array<TableAction | string>,
): Array<Required<TableAction>> {
  return tableActionList?.map(NormalizeTableAction) ?? [];
}

export function NormalizeTableColumn(
  column: TableColumn | string,
): Required<TableColumn> {
  let name: string;
  let type: string;
  let modifiers: string[] = [];
  let hasFilter = false;
  let title: string;
  let propertyPath: string;
  let hidden = false;
  let active = false;
  let inactive = false;
  let show = false;
  if (typeof column === 'string') {
    // name:type:modifier1,modifier2
    // username:string:filter,active
    const fragments = column.split(':');
    name = fragments[0];
    type = fragments[1] || undefined; // convert an empty string to undefined
    if (fragments[2]) {
      modifiers = fragments[2].split(/,(?![^(]*\))/g);
    }
    propertyPath = fragments[3] || undefined;
  } else {
    name = column.name;
    type = column.type;
    modifiers = column.modifiers ?? [];
    hasFilter = column.hasFilter ?? false;
    title = column.title || undefined;
    propertyPath = column.propertyPath || undefined;
    hidden = column.hidden ?? false;
    active = column.active ?? false;
    inactive = column.inactive ?? false;
    show = column.show ?? false;
  }
  propertyPath ??= name
    .split('.')
    .map((part) => camelize(part))
    .join('.');
  title ??= dasherize(name)
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
  hasFilter = modifiers.includes('filter') ?? hasFilter;
  active = modifiers.includes('active') ?? active;
  inactive = modifiers.includes('inactive') ?? inactive;
  show = modifiers.includes('show') ?? show;
  hidden = modifiers.includes('hidden') ?? hidden;
  type ??= 'unknown';
  return {
    name,
    type,
    modifiers,
    hasFilter,
    title,
    propertyPath,
    hidden,
    active,
    inactive,
    show,
  };
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<string | TableColumn>,
): Array<Required<TableColumn>> {
  return columnList?.map(NormalizeTableColumn) ?? [];
}

export function NormalizeTableHeaderButton(
  tableHeaderButton?: TableHeaderButton | string,
): Required<TableHeaderButton> | null {
  if (!tableHeaderButton) {
    return null;
  }
  let role: string;
  let icon: string | null = null;
  let svgIcon: string | null = null;
  let permission: string | null = null;
  if (typeof tableHeaderButton === 'string') {
    // role:modifier1,modifier2
    // create:icon(add),permission(create)
    const fragments = tableHeaderButton.split(':');
    role = fragments[0];
    if (fragments[1]) {
      const modifiers = fragments[1].split(/,(?![^(]*\))/g);
      if (modifiers.some((m) => m.match(/icon\(.+\)/))) {
        icon = modifiers
          .find((m) => m.match(/icon\(.+\)/))
          .replace(/^icon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/svgIcon\(.+\)/))) {
        svgIcon = modifiers
          .find((m) => m.match(/svgIcon\(.+\)/))
          .replace(/^svgIcon\(/, '')
          .replace(/\)$/, '');
      }
      if (modifiers.some((m) => m.match(/permission\(.+\)/))) {
        permission = modifiers
          .find((m) => m.match(/permission\(.+\)/))
          .replace(/^permission\(/, '')
          .replace(/\)$/, '');
      }
    }
  } else {
    role = tableHeaderButton.role;
    icon = tableHeaderButton.icon ?? null;
    svgIcon = tableHeaderButton.svgIcon ?? null;
    permission = tableHeaderButton.permission ?? null;
  }
  return {
    role,
    icon,
    svgIcon,
    permission,
  };
}

export function NormalizeTableComponentOptions(
  options: Readonly<TableComponentOptions>,
): Readonly<NormalizedTableComponentOptions> {
  const feature = dasherize(options.feature);
  const name = dasherize(options.name);
  let shared = options.shared ?? false;
  const project = dasherize(options.project ?? 'shared');
  if (project === 'shared') {
    shared = true;
  }
  const componentName = CoerceSuffix(name, '-table');
  const nestModule = options.nestModule ?? undefined;
  const controllerName = BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });

  return Object.seal({
    selectColumn: options.selectColumn ?? false,
    feature,
    name,
    project,
    directory: join(options.directory ?? '', componentName),
    shared,
    actionList: NormalizeTableActionList(options.actionList),
    columnList: NormalizeTableColumnList(options.columnList),
    componentName,
    headerButton: NormalizeTableHeaderButton(options.headerButton),
    nestModule,
    controllerName,
    modifiers: options.modifiers ?? [],
    overwrite: options.overwrite ?? false,
    title:
      options.title ??
      dasherize(componentName)
        .split('-')
        .map((part) => capitalize(part))
        .join(' '),
    context: options.context ?? '',
  });
}

export function TableColumnToGetPageOperationColumn(
  column: TableColumn,
): GetPageOperationColumn {
  return {
    name: column.name,
    type: column.type,
    source: column.propertyPath,
  };
}

export function TableColumnToFormControl(
  column: TableColumn,
): FormDefinitionControl {
  return {
    name: column.name,
    type: column.type,
  };
}

export default function (options: TableComponentOptions) {
  const normalizedOptions = NormalizeTableComponentOptions(options);
  const {
    name,
    project,
    feature,
    shared,
    actionList,
    columnList,
    headerButton,
    directory,
    nestModule,
    componentName,
    controllerName,
    modifiers,
    overwrite,
    context,
  } = normalizedOptions;
  console.log(
    `===== Generating table component '${ name }' for project '${ project }' in feature '${ feature }' in directory '${ directory }' with context '${ context }' and the nest module '${ nestModule }' and controller '${ controllerName }' ...`,
  );

  if (headerButton && headerButton.role !== 'form') {
    throw new Error(`The create option only support 'form' currently`);
  }

  return function (host: Tree) {
    const basePath = BuildAngularBasePath(host, normalizedOptions);

    const templateOptions = {
      ...normalizedOptions,
      OperationIdToClassName,
      OperationIdToClassImportPath,
      OperationIdToResponseClassName,
      OperationIdToResponseClassImportPath,
      operationId: buildOperationId(
        normalizedOptions,
        'get-page',
        controllerName,
      ),
      hasNavigationBackHeader: modifiers.includes('navigation-back-header'),
      hasWithoutTitle: modifiers.includes('without-title'),
    };

    return chain([
      () => console.log(`Coerce the table component ${ componentName }`),
      CoerceComponentRule({
        project,
        feature,
        shared,
        name: componentName,
        directory,
        overwrite,
        template: {
          options: templateOptions,
        },
      }),
      shared
        ? (tree) => {
          console.log(`Coerce the index.ts file`);
          CoerceFile(
            tree,
            join(basePath, 'index.ts'),
            `export * from './${ componentName }.component';\nexport * from './${ componentName }.component.module';`,
          );
        }
        : noop(),
      headerButton?.role === 'form'
        ? chain([
          () => console.log(`Coerce the form for the create button`),
          schematic('form-component', {
            project,
            name: 'create',
            feature,
            directory,
            shared,
            window: true,
            controlList: [],
            nestModule: (shared ? undefined : nestModule) ?? controllerName,
            context: joinWithDash([ context, controllerName ]),
          }),
        ])
        : noop(),
      () => console.log(`Coerce the filter form definition`),
      schematic('form-definition', {
        name: CoerceSuffix(controllerName, '-filter'),
        project,
        feature,
        shared,
        directory,
        controlList: columnList
          .filter((column) => column.hasFilter)
          .map(TableColumnToFormControl),
      }),
      () => console.log(`Coerce the getPage operation for the table`),
      CoerceGetPageOperation({
        controllerName,
        nestModule: shared ? undefined : nestModule,
        project,
        feature,
        shared,
        columnList: columnList.map(TableColumnToGetPageOperationColumn),
        context,
      }),
      () =>
        console.log(
          `Coerce the table cell components count: ${
            columnList.filter((column) => column.type === 'component').length
          }`,
        ),
      chain(
        columnList
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
      ),
      () =>
        console.log(
          `Coerce the table action components count: ${ actionList.length }`,
        ),
      chain(
        actionList.map((action) => {
          switch (action.role) {
            case 'operation':
              return chain([
                () =>
                  console.log(`Coerce operation table action '${ action.type }'`),
                schematic('operation-table-action', {
                  ...DeleteEmptyProperties(action),
                  overwrite,
                  project,
                  feature,
                  shared,
                  tableName: componentName,
                  directory,
                  nestModule:
                    (shared ? undefined : nestModule) ?? controllerName,
                  context: joinWithDash([ context, controllerName ]),
                }),
              ]);

            case 'form':
              return chain([
                () => console.log(`Coerce form table action '${ action.type }'`),
                schematic('form-table-action', {
                  ...DeleteEmptyProperties(action),
                  overwrite,
                  project,
                  feature,
                  shared,
                  tableName: componentName,
                  directory,
                  nestModule:
                    (shared ? undefined : nestModule) ?? controllerName,
                  context: joinWithDash([ context, controllerName ]),
                }),
              ]);

            case 'link':
            case 'navigate':
              return chain([
                () =>
                  console.log(`Coerce navigate table action '${ action.type }'`),
                schematic('navigate-table-action', {
                  ...DeleteEmptyProperties(action),
                  overwrite,
                  project,
                  feature,
                  shared,
                  tableName: componentName,
                  directory,
                }),
              ]);

            case 'dialog':
              return chain([
                () =>
                  console.log(`Coerce dialog table action '${ action.type }'`),
                schematic('dialog-table-action', {
                  ...DeleteEmptyProperties(action),
                  overwrite,
                  project,
                  feature,
                  shared,
                  tableName: componentName,
                  directory,
                  nestModule:
                    (shared ? undefined : nestModule) ?? controllerName,
                  context: joinWithDash([ context, controllerName ]),
                }),
              ]);

            case 'method':
            default:
              return chain([
                () => console.log(`Coerce table action '${ action.type }'`),
                schematic('table-action', {
                  ...DeleteEmptyProperties(action),
                  overwrite,
                  project,
                  feature,
                  shared,
                  tableName: componentName,
                  directory,
                }),
              ]);
          }
        }),
      ),
    ]);
  };
}
