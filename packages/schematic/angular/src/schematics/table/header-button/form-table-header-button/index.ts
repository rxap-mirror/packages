import {
  chain,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  CoerceClassConstructor,
  CoerceImports,
  CoerceParameterDeclaration,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
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
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import {
  NormalizedFormComponentControl,
  NormalizeFormComponentControlList,
} from '../../../../lib/form-component-control';
import { NormalizedTableHeaderButton } from '../../../../lib/table-header-button';
import { NormalizeTableHeaderButtonOptions } from '../../table-header-button/index';
import { FormTableHeaderButtonOptions } from './schema';

export interface NormalizedFormTableHeaderButtonOptions
  extends Omit<Readonly<Normalized<FormTableHeaderButtonOptions> & NormalizedAngularOptions & NormalizedTableHeaderButton>, 'formOptions'> {
  options: Record<string, any>;
  controllerName: string;
  formComponent: string;
  // TODO : create custom interface and normalization function for the formOptions property (also used in form-table-action)
  formOptions: {
    controlList: NormalizedFormComponentControl[];
    role: string | null;
    window: boolean;
  };
}

export function NormalizeFormTableHeaderButtonOptions(
  options: Readonly<FormTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedTableHeaderButtonOptions = NormalizeTableHeaderButtonOptions(options);
  const nestModule = options.nestModule;
  const formOptions = options.formOptions ?? {};
  const { tableName } = normalizedTableHeaderButtonOptions;
  return Object.seal({
    ...normalizedTableHeaderButtonOptions,
    context: options.context,
    nestModule,
    controllerName: BuildNestControllerName({
      nestModule,
      controllerName: 'header-button',
    }),
    formComponent: CoerceSuffix(
      dasherize(options.formComponent ?? tableName.replace(/-table$/, '')), '-form'),
    customComponent: options.customComponent ?? false,
    formOptions: {
      window: formOptions.window ?? true,
      role: formOptions.role ?? null,
      controlList: NormalizeFormComponentControlList(formOptions.controlList),
    },
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
    formOptions,
    context,
    backend,
    nestModule,
    controllerName,
    formComponent,
    customComponent,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    const ruleList: Rule[] = [
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-header-button]\x1b[0m'),
    ];

    if (!customComponent) {
      ruleList.push(
        () => console.log('Coerce table header button form ...'),
        ExecuteSchematic('form-component', {
          ...formOptions,
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
