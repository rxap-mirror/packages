import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceFormTableActionRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import { backendRule } from './backend/backend-rule';
import { buildLoadFormOptions } from './build-load-form-options';
import {
  NormalizedFormTableActionOptions,
  NormalizeFormTableActionOptions,
} from './normalize-form-table-action-options';
import { FormTableActionOptions } from './schema';


function printOptions(options: NormalizedFormTableActionOptions) {
  PrintAngularOptions('form-table-action', options);
}

export default function (options: FormTableActionOptions) {
  const normalizedOptions = NormalizeFormTableActionOptions(options);
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
    context,
    controllerName,
    overwrite,
    scope,
    backend,
    formInitial,
    formComponent,
    customComponent,
    form,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    const ruleList: Rule[] = [
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-action]\x1b[0m'),
      () => console.info(`Generating form table action rule...`),
      CoerceFormTableActionRule({
        scope,
        directory: join(directory ?? '', 'methods', 'action'),
        loadFrom: buildLoadFormOptions(normalizedOptions),
        formInitial,
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
        formComponent,
      }),
      () => console.log('Coerce open form window method to table component ...'),
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
        ) => {
          AddComponentProvider(
            sourceFile,
            `Open${ classify(formComponent) }WindowMethod`,
            [
              {
                moduleSpecifier: `./${ dasherize(formComponent) }/open-${ dasherize(
                  formComponent) }-window.method`,
                namedImports: [ `Open${ classify(formComponent) }WindowMethod` ],
              },
            ],
          );
        },
      }),
    ];

    if (!customComponent) {
      ruleList.push(
        () => console.info(`Generating form component...`),
        ExecuteSchematic('form-component', {
          ...form ?? {},
          project,
          name: formComponent.replace(/-form$/, ''),
          feature,
          directory,
          shared,
          nestModule,
          controllerName,
          overwrite,
          context,
          backend,
        }),
        () => console.info(`Generating backend...`),
        backendRule(normalizedOptions),
      );
    }

    ruleList.push(() => console.groupEnd());

    return chain(ruleList);
  };
}
