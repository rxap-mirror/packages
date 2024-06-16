import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  CoerceComponentOptions,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { MethodKinds } from '../../../../lib/method/method-kinds';
import { AssertIsNormalizedImportMethodOptions } from '../../../../lib/method/method-options';
import {
  MethodHeaderButton,
  NormalizedMethodHeaderButton,
  NormalizeMethodHeaderButton,
} from '../../../../lib/table/header-button/method-header-button';
import { MethodTableHeaderButtonOptions } from './schema';

export type NormalizedFormTableHeaderButtonOptions = Readonly<Normalized<Omit<MethodTableHeaderButtonOptions, keyof AngularOptions | keyof MethodHeaderButton>> & NormalizedAngularOptions & NormalizedMethodHeaderButton> & {
  controllerName: string;
}

export function NormalizeFormTableHeaderButtonOptions(
  options: Readonly<MethodTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeMethodHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const { nestModule, controllerName } = normalizedAngularOptions;
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableHeaderButton,
    tableName,
    controllerName: controllerName ?? BuildNestControllerName({
      nestModule,
      controllerName,
      controllerNameSuffix: 'header-button',
    }),
  });
}

function printOptions(options: NormalizedFormTableHeaderButtonOptions) {
  PrintAngularOptions('method-table-header-button', options);
}

export default function (options: MethodTableHeaderButtonOptions) {
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
    context,
    backend,
    nestModule,
    controllerName,
    method,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    const ruleList: Rule[] = [
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-header-button]\x1b[0m'),
    ];

    let methodName: string | null = null;
    let methodModuleSpecifier: string | null = null;

    switch (method.kind) {

      case MethodKinds.IMPORT:
        AssertIsNormalizedImportMethodOptions(method);
        methodName = method.import.name;
        methodModuleSpecifier = method.import.moduleSpecifier;
        break;

      default:
        throw new Error(`Unsupported method kind: ${ method.kind }`);

    }

    if (!methodName || !methodModuleSpecifier) {
      throw new Error('FATAL: should never happen');
    }

    ruleList.push(
      () => console.log('Coerce table header button method ...'),
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
              useExisting: methodName,
            },
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'TABLE_HEADER_BUTTON_METHOD' ],
              },
              {
                moduleSpecifier: methodModuleSpecifier,
                namedImports: [ methodName ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            methodName,
            [
              {
                moduleSpecifier: methodModuleSpecifier,
                namedImports: [ methodName ],
              },
            ],
          );
        },
      }),
      () => console.groupEnd(),
    );

    return chain(ruleList);
  };
}
