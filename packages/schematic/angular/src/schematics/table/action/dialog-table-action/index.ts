import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceDialogTableActionComponentRule,
  CoerceDialogTableActionRule,
  CoerceOperation,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDtoClass,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  DialogTableAction,
  NormalizedDialogTableAction,
  NormalizeDialogTableAction,
} from '../../../../lib/table/action/dialog-table-action';
import { DialogTableActionOptions } from './schema';

export type NormalizedDialogTableActionOptions = Readonly<Normalized<Omit<DialogTableActionOptions, keyof DialogTableAction | keyof AngularOptions>> & NormalizedDialogTableAction & NormalizedAngularOptions>

export function NormalizeDialogTableActionOptions(
  options: DialogTableActionOptions,
): NormalizedDialogTableActionOptions {
  return Object.freeze({
    ...NormalizeAngularOptions(options),
    ...NormalizeDialogTableAction(options),
    tableName: options.tableName,
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
    backend,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    const ruleList: Rule[] = [
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
    ];

    if (controllerName) {
      ruleList.push(
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
          backend,
          tsMorphTransform: (
            project,
            sourceFile,
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
      );
    }

    ruleList.push(() => console.groupEnd());

    return chain(ruleList);
  };
}
