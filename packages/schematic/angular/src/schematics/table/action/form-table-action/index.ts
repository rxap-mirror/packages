import {
  chain,
  noop,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceDtoClass,
  CoerceFormSubmitOperation,
  CoerceFormTableActionRule,
  CoerceImports,
  CoerceOperation,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  classify,
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  OptionalKind,
  Project,
  SourceFile,
  TypeAliasDeclarationStructure,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { BackendTypes } from '../../../../lib/backend-types';
import {
  NormalizedFormComponentControl,
  NormalizeFormComponentControlList,
} from '../../../../lib/form-component-control';
import { FormComponentControlToDtoClassProperty } from '../../../form/form-component/index';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from '../operation-table-action';
import { FormTableActionOptions } from './schema';

export interface NormalizedFormTableActionOptions
  extends Readonly<Normalized<FormTableActionOptions> & NormalizedOperationTableActionOptions> {
  options: Record<string, any> & {
    controlList: NormalizedFormComponentControl[];
  };
}

export function NormalizeFormTableActionOptions(
  options: Readonly<FormTableActionOptions>,
): NormalizedFormTableActionOptions {
  const normalizedOptions = NormalizeOperationTableActionOptions(options);
  const {
    controllerName,
    type,
    nestModule,
  } = normalizedOptions;
  return {
    ...normalizedOptions,
    controllerName: BuildNestControllerName({
      nestModule,
      controllerName: [ type, 'action' ].join('-'),
    }),
    options: {
      ...normalizedOptions.options ?? {},
      controlList: NormalizeFormComponentControlList(normalizedOptions.options?.['controlList'] ?? []),
    },
  };
}

export function CoerceTypeAlias(
  sourceFile: SourceFile,
  name: string,
  structure: Omit<OptionalKind<TypeAliasDeclarationStructure>, 'name'>,
) {
  let typeAliasDeclaration = sourceFile.getTypeAlias(name);
  if (!typeAliasDeclaration) {
    typeAliasDeclaration = sourceFile.addTypeAlias({
      ...structure,
      name,
    });
  }
  return typeAliasDeclaration;
}

interface UseOperationResponseAsFormTypeRuleOptions
  extends TsMorphAngularProjectTransformOptions {
  name: string;
  operationId: string;
  scope?: string | null;
}

function UseOperationResponseAsFormTypeRule(
  options: UseOperationResponseAsFormTypeRuleOptions,
): Rule {
  const {
    name,
    operationId,
    scope,
  } = options;

  const className = CoerceSuffix(classify(name), 'Form');
  const interfaceName = `I${ className }`;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const interfaceDeclaration = sourceFile.getInterface(interfaceName);
    if (interfaceDeclaration) {
      interfaceDeclaration.remove();
    }

    CoerceTypeAlias(sourceFile, interfaceName, {
      type: OperationIdToResponseClassName(operationId),
      isExported: true,
    }).set({ type: OperationIdToResponseClassName(operationId) });

    CoerceImports(sourceFile, {
      namedImports: [ OperationIdToResponseClassName(operationId) ],
      moduleSpecifier: OperationIdToResponseClassImportPath(operationId, scope),
    });
  }, [ '/' + CoerceSuffix(name, '.form.ts') ]);
}

function nestjsBackendRule(normalizedOptions: NormalizedFormTableActionOptions): Rule {

  const {
    project,
    feature,
    shared,
    directory,
    nestModule,
    type,
    context,
    controllerName,
    scope,
  } = normalizedOptions;

  if (!nestModule) {
    throw new Error('The nest module is required');
  }

  const controllerPath = `${ dasherize(nestModule) }/action/:rowId/${ type }`;

  return chain([
    () => console.log('Coerce form get table action operation'),
    CoerceOperation({
      controllerName,
      nestModule,
      project,
      feature,
      shared,
      context,
      operationName: `get`,
      controllerPath,
      tsMorphTransform: (
        project,
        sourceFile,
      ) => {
        const {
          className,
          filePath,
        } = CoerceDtoClass({
          project,
          name: controllerName,
          propertyList: normalizedOptions.options.controlList.map(control => FormComponentControlToDtoClassProperty(
            control)),
        });

        CoerceImports(sourceFile, {
          namedImports: [ className ],
          moduleSpecifier: filePath,
        });

        return {
          returnType: className,
          paramList: [
            {
              name: 'rowId',
              fromParent: true,
            },
          ],
        };
      },
    }),
    () => console.log('Coerce form submit table action operation'),
    CoerceFormSubmitOperation({
      controllerName,
      project,
      feature,
      shared,
      nestModule,
      context,
      controllerPath,
      paramList: [
        {
          name: 'rowId',
          fromParent: true,
        },
      ],
      bodyDtoName: controllerName,
    }),
    () => console.log('Update form type alias'),
    UseOperationResponseAsFormTypeRule({
      scope,
      project,
      feature,
      directory: join(directory ?? '', CoerceSuffix(type, '-form')),
      name: type,
      operationId: buildGetOperationId(normalizedOptions),
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedFormTableActionOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}

function printOptions(options: NormalizedFormTableActionOptions) {
  PrintAngularOptions('form-table-action', options);
}

function buildGetOperationId(normalizedOptions: NormalizedFormTableActionOptions) {
  const {
    controllerName,
  } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    `get`,
    controllerName,
  );
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
    options: formOptions,
    backend,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:form-table-action]\x1b[0m'),
      () => console.info(`Generating form table action rule...`),
      CoerceFormTableActionRule({
        scope,
        directory: join(directory ?? '', 'methods', 'action'),
        loadOperationId: backend === BackendTypes.NESTJS ? buildGetOperationId(normalizedOptions) : undefined,
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
            `Open${ classify(type) }FormWindowMethod`,
            [
              {
                moduleSpecifier: `./${ type }-form/open-${ type }-form-window.method`,
                namedImports: [ `Open${ classify(type) }FormWindowMethod` ],
              },
            ],
          );
        },
      }),
      () => console.info(`Generating form component...`),
      ExecuteSchematic('form-component', {
        ...formOptions ?? {},
        project,
        name: type,
        feature,
        directory,
        shared,
        window: true,
        role: type,
        nestModule,
        controllerName,
        overwrite,
        context,
        backend,
      }),
      () => console.info(`Generating backend...`),
      backendRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
