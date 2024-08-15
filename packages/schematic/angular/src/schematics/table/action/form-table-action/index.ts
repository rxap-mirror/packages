import {
  chain,
  noop,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  buildOperationId,
  CoerceComponentRule,
  CoerceFormSubmitOperation,
  CoerceFormTableActionRule,
  CoerceOperation,
  LoadFromTableActionOptions,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  CoerceDtoClass,
  CoerceImports,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { TsMorphAngularProjectTransformOptions } from '@rxap/workspace-ts-morph';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  OptionalKind,
  Project,
  SourceFile,
  TypeAliasDeclarationStructure,
} from 'ts-morph';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { BackendTypes } from '../../../../lib/backend/backend-types';
import { ControlToDtoClassProperty } from '../../../../lib/form/control';
import {
  FormTableAction,
  NormalizedFormTableAction,
  NormalizeFormTableAction,
} from '../../../../lib/table/action/form-table-action';
import { FormTableActionOptions } from './schema';

export type NormalizedFormTableActionOptions = Readonly<Normalized<Omit<FormTableActionOptions, keyof FormTableAction | keyof AngularOptions>> & NormalizedFormTableAction & NormalizedAngularOptions>


export function NormalizeFormTableActionOptions(
  options: Readonly<FormTableActionOptions>,
): NormalizedFormTableActionOptions {
  const normalizedOptions = NormalizeAngularOptions(options);
  const tableActionOptions = NormalizeFormTableAction(options);
  const { type } = tableActionOptions;
  let { controllerName, nestModule } = normalizedOptions;
  const { tableName } = options;
  nestModule ??= tableName;
  controllerName ??= BuildNestControllerName({
    controllerName: CoerceSuffix(type, '-action'),
    nestModule,
  });
  return {
    ...normalizedOptions,
    ...tableActionOptions,
    tableName,
    controllerName,
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
    backend,
    overwrite,
  } = normalizedOptions;

  if (!nestModule) {
    throw new Error('The nest module is required');
  }

  if (!controllerName) {
    throw new Error('The controller name is required');
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
      overwrite,
      operationName: `get`,
      controllerPath,
      backend,
      tsMorphTransform: (
        project,
        sourceFile,
      ) => {

        const getDtoPropertyList = normalizedOptions.form?.controlList.map(
          control => ControlToDtoClassProperty(control)) ?? [];

        // set all properties to optional, as it is possible that a property is required for submitting
        // but not for getting the initial form data
        getDtoPropertyList.forEach(property => {
          property.isOptional = true;
        });

        const {
          className,
          filePath,
        } = CoerceDtoClass({
          project,
          name: controllerName,
          propertyList: getDtoPropertyList,
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
      backend,
      controllerPath,
      overwrite,
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

  switch (backend.kind) {

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
  if (!controllerName) {
    throw new Error('The controller name is required');
  }
  return buildOperationId(
    normalizedOptions,
    `get`,
    controllerName,
  );
}

function buildLoadFormOptions(normalizedOptions: NormalizedFormTableActionOptions): LoadFromTableActionOptions | undefined {

  const { backend } = normalizedOptions;

  let loadFrom: LoadFromTableActionOptions | undefined = undefined;
  if (backend.kind === BackendTypes.NESTJS) {
    loadFrom = {
      operationId: buildGetOperationId(normalizedOptions),
      body: false,
      parameters: {
        rowId: 'rowId',
      },
    };
  } else if (normalizedOptions.loadFrom) {
    loadFrom = normalizedOptions.loadFrom as any;
  }

  return loadFrom;

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
