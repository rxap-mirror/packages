import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceParameterDeclaration,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceClassConstructor,
  CoerceDependencyInjection,
  CoerceImports,
  Module,
} from '@rxap/ts-morph';
import {
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  Project,
  Scope,
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

export type NormalizedFormTableHeaderButtonOptions = Readonly<Normalized<Omit<MethodTableHeaderButtonOptions, keyof AngularOptions | keyof MethodHeaderButton>> & NormalizedAngularOptions & NormalizedMethodHeaderButton>;

export function NormalizeMethodTableHeaderButtonOptions(
  options: Readonly<MethodTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeMethodHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableHeaderButton,
    tableName,
  });
}

function printOptions(options: NormalizedFormTableHeaderButtonOptions) {
  PrintAngularOptions('method-table-header-button', options);
}

export default function (options: MethodTableHeaderButtonOptions) {
  const normalizedOptions = NormalizeMethodTableHeaderButtonOptions(options);
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
        tsMorphTransform: (_, sourceFile) => {
          CoerceDependencyInjection(sourceFile, {
            injectionToken: methodName,
            parameterName: 'method',
            module: Module.ANGULAR,
          });
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: methodModuleSpecifier.startsWith('.') ? join('..', methodModuleSpecifier) : methodModuleSpecifier,
              namedImports: [ methodName ],
            },
          ]);
          return {
            statements: [ 'return this.method.call(parameters).toPromise();' ],
          };
        },
        tsMorphTransformComponent: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
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
