import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  CoerceParameterDeclaration,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  CoerceClassConstructor,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import {
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  FormHeaderButton,
  NormalizedFormHeaderButton,
  NormalizeFormHeaderButton,
} from '../../../../lib/table/header-button/form-header-button';
import { FormTableHeaderButtonOptions } from './schema';

export type NormalizedFormTableHeaderButtonOptions = Readonly<Normalized<Omit<FormTableHeaderButtonOptions, keyof AngularOptions | keyof FormHeaderButton>> & NormalizedAngularOptions & NormalizedFormHeaderButton> & {
  controllerName: string;
}

export function NormalizeFormTableHeaderButtonOptions(
  options: Readonly<FormTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeFormHeaderButton(options, options.tableName);
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
  PrintAngularOptions('form-table-header-button', options);
}

export default function (options: FormTableHeaderButtonOptions) {
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
    form,
    context,
    backend,
    nestModule,
    controllerName,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    const formComponent = CoerceSuffix(dasherize(tableName.replace(/-table$/, '')), '-form');

    const ruleList: Rule[] = [
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-header-button]\x1b[0m'),
    ];

    ruleList.push(
      () => console.log('Coerce table header button form ...'),
      ExecuteSchematic('form-component', {
        ...form,
        project,
        name: formComponent.replace(/-form$/, ''),
        feature,
        directory,
        shared,
        window: true,
        nestModule,
        controllerName,
        context,
        backend,
        overwrite,
      }),
    );

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
        tsMorphTransform: (project, sourceFile, classDeclaration) => {
          const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
          CoerceParameterDeclaration(constructorDeclaration, 'openWindowMethod', {
            isReadonly: true,
            scope: Scope.Private,
            type: `Open${ classify(formComponent) }WindowMethod`,
          });
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: `../${ dasherize(formComponent) }/open-${ dasherize(formComponent) }-window.method`,
              namedImports: [ `Open${ classify(formComponent) }WindowMethod` ],
            },
          ]);
          return {
            statements: [ 'return this.openWindowMethod.call(parameters).toPromise();' ],
          };
        },
        tsMorphTransformComponent: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
          AddComponentProvider(
            sourceFile,
            `Open${ classify(formComponent) }WindowMethod`,
            [
              {
                moduleSpecifier: `./${ dasherize(formComponent) }/open-${ dasherize(formComponent) }-window.method`,
                namedImports: [ `Open${ classify(formComponent) }WindowMethod` ],
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
