import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceDialogTableActionComponentRule,
  CoerceDialogTableActionRule,
  CoerceDtoClass,
  CoerceImports,
  CoerceOperation,
} from '@rxap/schematics-ts-morph';
import {
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import {
  NormalizedDialogAction,
  NormalizeDialogActionList,
} from '../../../../lib/dialog-action';
import { ToTitle } from '../../../../lib/to-title';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from '../operation-table-action';
import { DialogTableActionOptions } from './schema';

export interface NormalizedDialogTableActionOptions
  extends Readonly<Normalized<Omit<DialogTableActionOptions, 'actionList'>> & NormalizedOperationTableActionOptions> {
  title: string;
  actionList: ReadonlyArray<NormalizedDialogAction>;
}

export function NormalizeDialogTableActionOptions(
  options: DialogTableActionOptions,
): NormalizedDialogTableActionOptions {
  const actionList = options.actionList?.slice() ?? [];
  if (actionList.length === 0) {
    actionList.push({
      role: 'close',
      label: 'Cancel',
    });
    actionList.push({ role: 'submit' });
  }
  return Object.freeze({
    ...NormalizeOperationTableActionOptions(options),
    withoutBody: options.withoutBody ?? false,
    actionList: NormalizeDialogActionList(actionList),
    title: options.title ?? ToTitle(options.type),
    overwrite: options.overwrite ?? false as any,
  });
}

function printOptions(options: NormalizedDialogTableActionOptions) {
  PrintAngularOptions('dialog-table-action', options);
}

export default function (options: DialogTableActionOptions) {
  const normalizedOptions = NormalizeDialogTableActionOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    priority,
    checkFunction,
    tableName,
    project,
    feature,
    shared,
    directory,
    nestModule,
    type,
    withoutBody,
    title,
    overwrite,
    context,
    controllerName,
    scope,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:dialog-table-action]\x1b[0m'),
      () => console.log('Coerce table action method class ...'),
      CoerceDialogTableActionRule({
        directory: join(directory ?? '', 'methods', 'action'),
        type,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
        priority,
        checkFunction,
        project,
        feature,
      }),
      () => console.log('Coerce table action dialog component ...'),
      CoerceDialogTableActionComponentRule({
        scope,
        dialogName: `${ type }-dialog`,
        tableName,
        directory,
        operationId: buildOperationId(
          normalizedOptions,
          `${ type }-action`,
          BuildNestControllerName({
            controllerName,
            nestModule,
          }),
        ),
        project,
        feature,
        template: { options: normalizedOptions },
        title,
        overwrite,
      }),
      () => console.log('Coerce table action dialog operation ...'),
      CoerceOperation({
        nestModule,
        controllerName,
        project,
        feature,
        overwrite,
        shared,
        overwriteControllerPath: true,
        operationName: `${ type }-action`,
        tsMorphTransform: (
          project,
          sourceFile,
          classDeclaration,
          controllerName,
        ) => {
          let body: string | undefined = undefined;
          if (!withoutBody) {
            const {
              className,
              filePath,
            } = CoerceDtoClass({
              project,
              name: joinWithDash([ context, `${ type }-action-body` ]),
            });
            body = className;
            CoerceImports(sourceFile, {
              moduleSpecifier: filePath,
              namedImports: [ className ],
            });
          }
          return {
            body,
            method: 'put',
            path: `action/:rowId/${ type }`,
            paramList: [ { name: 'rowId' } ],
          };
        },
      }),
      () => console.groupEnd(),
    ]);
  };
}
