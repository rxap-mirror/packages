import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDependencyInjection,
  CoerceImports,
  Module,
} from '@rxap/ts-morph';
import { join } from 'path';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { MethodKinds } from '../../../../lib/method/method-kinds';
import { AssertIsNormalizedImportMethodOptions } from '../../../../lib/method/method-options';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import {
  NormalizedFormTableHeaderButtonOptions,
  NormalizeMethodTableHeaderButtonOptions,
} from './normalize-method-table-header-button-options';
import { MethodTableHeaderButtonOptions } from './schema';

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
