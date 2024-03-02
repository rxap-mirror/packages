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
  LoadFromTableActionOptions,
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
  ControlToDtoClassProperty,
  NormalizeControlList,
  NormalizedControl,
} from '../../../../lib/form/control';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from '../operation-table-action';
import { FormTableActionOptions } from './schema';

export interface NormalizedFormTableActionOptions
  extends Omit<Readonly<Normalized<FormTableActionOptions> & NormalizedOperationTableActionOptions>, 'formOptions'> {
  formComponent: string;
  formOptions: {
    // TODO : create custom interface and normalization function for the formOptions property (also used in form-table-header-button)
    controlList: ReadonlyArray<NormalizedControl>;
    role: string | null;
    window: boolean;
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
    tableName,
  } = normalizedOptions;
  const loadFrom = options.loadFrom ?? null;
  const formInitial = options.formInitial ?? null;
  const formOptions = options.formOptions ?? {};
  return {
    ...normalizedOptions,
    controllerName: BuildNestControllerName({
      nestModule,
      controllerName: [ type, 'action' ].join('-'),
    }),
    formComponent: CoerceSuffix(dasherize(options.formComponent ?? type), '-form'),
    loadFrom: Object.keys(loadFrom ?? {}).length ? loadFrom : null,
    formInitial: Object.keys(formInitial ?? {}).length ? formInitial : null,
    customComponent: options.customComponent ?? false,
    formOptions: {
      window: formOptions.window ?? true,
      role: formOptions.role ?? type,
      controlList: NormalizeControlList(formOptions.controlList),
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
          propertyList: normalizedOptions.formOptions?.controlList.map(
            control => ControlToDtoClassProperty(control)) ?? [],
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

function buildLoadFormOptions(normalizedOptions: NormalizedFormTableActionOptions): LoadFromTableActionOptions | undefined {

  const { backend } = normalizedOptions;

  let loadFrom: LoadFromTableActionOptions | undefined = undefined;
  if (backend === BackendTypes.NESTJS) {
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
    formOptions,
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
          ...formOptions ?? {},
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
