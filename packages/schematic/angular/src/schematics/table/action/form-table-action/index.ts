import {
  chain,
  noop,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceDtoClass,
  CoerceFormSubmitOperation,
  CoerceFormTableActionRule,
  CoerceImports,
  CoerceOperation,
  CoerceSourceFile,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  classify,
  CoerceSuffix,
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  OptionalKind,
  SourceFile,
  TypeAliasDeclarationStructure,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { BackendTypes } from '../../../../lib/backend-types';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from '../operation-table-action';
import { FormTableActionOptions } from './schema';

export type NormalizedFormTableActionOptions = Readonly<Normalized<FormTableActionOptions>>
  & NormalizedOperationTableActionOptions;

export function NormalizeFormTableActionOptions(
  options: Readonly<FormTableActionOptions>,
): NormalizedFormTableActionOptions {
  return {
    ...NormalizeOperationTableActionOptions(options),
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

  return TsMorphAngularProjectTransformRule(options, (project) => {
    const sourceFile = CoerceSourceFile(
      project,
      '/' + CoerceSuffix(name, '.form.ts'),
    );

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
  });
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

  return chain([
    CoerceOperation({
      controllerName,
      nestModule,
      project,
      feature,
      shared,
      operationName: `get`,
      controllerPath: `action/:rowId/${ type }`,
      overwriteControllerPath: true,
      tsMorphTransform: (
        project,
        sourceFile,
      ) => {
        const {
          className,
          filePath,
        } = CoerceDtoClass({
          project,
          name: joinWithDash([ context, type, 'action', type, 'form' ]),
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
    CoerceFormSubmitOperation({
      controllerName,
      project,
      feature,
      shared,
      nestModule,
      paramList: [
        {
          name: 'rowId',
          fromParent: true,
        },
      ],
      bodyDtoName: joinWithDash([ context, type, 'action', type, 'form' ]),
    }),
    UseOperationResponseAsFormTypeRule({
      scope,
      project,
      feature,
      directory: join(directory ?? '', CoerceSuffix(type, '-form')),
      name: type,
      operationId: buildOperationId(
        normalizedOptions,
        `get`,
        BuildNestControllerName({
          controllerName,
          nestModule,
        }),
      ),
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedFormTableActionOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);
      break;

  }

  return noop();

}

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
    options: formOptions,
    backend,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.info(`Generating form table action rule...`),
      CoerceFormTableActionRule({
        scope,
        directory: join(directory ?? '', 'methods', 'action'),
        loadOperationId: backend === BackendTypes.NESTJS ? buildOperationId(
          normalizedOptions,
          `get`,
          BuildNestControllerName({
            controllerName,
            nestModule,
          }),
        ) : undefined,
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
        context: joinWithDash([ context, type, 'action' ]),
      }),
      () => console.info(`Generating backend...`),
      backendRule(normalizedOptions),
    ]);
  };
}
