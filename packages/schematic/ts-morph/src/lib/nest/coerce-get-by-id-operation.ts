import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceImports,
  CoerceNestModuleImport,
  CoerceNestModuleProvider,
  CoercePropertyDeclaration,
  IsNormalizedOpenApiUpstreamOptions,
  OperationIdToCommandClassImportPath,
  OperationIdToCommandClassName,
  OperationParameter,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  camelize,
  noop,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { OperationOptions } from './add-operation-to-controller';
import {
  CoerceDtoClassOutput,
} from './coerce-dto-class';
import { CoerceGetDataGridOperationOptions } from './coerce-get-data-grid-operation';
import {
  CoerceGetControllerOptions,
  CoerceGetOperation,
} from './coerce-get-operation';

export interface CoerceGetByIdControllerOptions extends CoerceGetControllerOptions {
  idProperty?: OperationParameter | null,
  upstream?: UpstreamOptions | null;
  coerceUpstreamOperationImplementation?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput,
    options: Readonly<CoerceGetDataGridOperationOptions>,
  ) => OperationOptions;
}

export function CoerceUpstreamBasicOperationImplementation(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  upstream: UpstreamOptions,
): { className: string, memberName: string } {
  if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
    const commandClassName = OperationIdToCommandClassName(upstream.operationId);
    CoerceImports(sourceFile, {
      namedImports: [ commandClassName ],
      moduleSpecifier: OperationIdToCommandClassImportPath(upstream.operationId, upstream.scope, upstream.isService),
    });
    CoerceNestModuleImport(moduleSourceFile, {
      moduleName: 'HttpModule',
      moduleSpecifier: '@nestjs/axios',
    });
    CoerceNestModuleProvider(moduleSourceFile, {
      providerObject: 'Logger',
      moduleSpecifier: '@nestjs/common',
    });
    CoerceNestModuleProvider(moduleSourceFile, {
      providerObject: commandClassName,
      moduleSpecifier: OperationIdToCommandClassImportPath(upstream.operationId, upstream.scope, upstream.isService),
    });
    const commandMemberName = camelize(commandClassName);
    CoerceImports(sourceFile, {
      namedImports: [ 'Inject' ],
      moduleSpecifier: '@nestjs/common',
    });
    CoercePropertyDeclaration(classDeclaration, commandMemberName, {
      type: commandClassName,
      hasQuestionToken: true,
      scope: Scope.Private,
      isReadonly: true,
      decorators: [
        {
          name: 'Inject',
          arguments: [ commandClassName ],
        },
      ],
    });
    return {
      className: commandClassName,
      memberName: commandMemberName,
    };
  }
  throw new Error(`Upstream kind '${upstream.kind}' not supported`);
}

export function CoerceUpstreamDefaultOperationImplementation(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput,
  options: Readonly<CoerceGetDataGridOperationOptions>,
): OperationOptions {
  const {
    upstream,
    idProperty,
    propertyList = []
  } = options;
  if (upstream) {
    if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
      const { memberName: commandMemberName } = CoerceUpstreamBasicOperationImplementation(sourceFile, classDeclaration, moduleSourceFile, upstream);
      const mapper: Record<string, string | WriterFunction> = {};
      for (const property of propertyList) {
        mapper[property.name] = `data.${ property.name }`;
      }
      const commandParameter = idProperty ? `{ parameters: { ${ idProperty.name } } }` : '';
      CoerceImports(sourceFile, {
        namedImports: [ 'plainToInstance' ],
        moduleSpecifier: 'class-transformer'
      });
      return {
        isAsync: true,
        statements: [
          `const data = await this.${ commandMemberName }.execute(${ commandParameter })`,
          'return plainToInstance(',
          dto.className,
          Writers.object(mapper),
          ');',
        ],
      };
    }
  }
  return {};
}

export function CoerceGetByIdOperation(options: CoerceGetByIdControllerOptions) {
  const {
    tsMorphTransform = noop,
    controllerName,
    paramList= [],
    propertyList = [],
    idProperty = { name: 'uuid', type: 'string' },
    operationName = 'getById',
    coerceUpstreamOperationImplementation = CoerceUpstreamDefaultOperationImplementation,
  } = options;
  let { nestModule } = options;

  if (idProperty) {
    /**
     * If the module is not specified. This controller has an own module. Else the
     * module is originated by another controller.
     *
     * **Example**
     * true:
     * The controller ReportDetailsController should be extended with getById Operation.
     * And the controller is used in the module ReportDetailsModule
     *
     * name = "report-details"
     * module = undefined
     *
     * false:
     * The controller ReportDetailsNotificationController should be extend with getById Operation.
     * And the controller ise used in the module ReportDetailsModule
     *
     * name = "notification"
     * module = "report-details"
     */
    const isFirstBornSibling = !nestModule || nestModule === controllerName;

    if (isFirstBornSibling && !propertyList.some(param => param.name === idProperty.name)) {
      propertyList.unshift({
        name: idProperty.name,
        type: idProperty.type ?? 'string',
        isArray: idProperty.isArray,
      });
    }

    if (isFirstBornSibling) {
      nestModule = controllerName;
    }

    if (!paramList.some(param => param.name === idProperty.name)) {
      paramList.push({
        name: idProperty.name,
        type: idProperty.type,
        alias: idProperty.alias ?? isFirstBornSibling ? undefined : CoerceSuffix(nestModule!, '-' + idProperty.name),
        fromParent: idProperty.fromParent ?? !isFirstBornSibling,
      });
    }

  }

  return CoerceGetOperation({
    ...options,
    operationName,
    nestModule,
    paramList,
    propertyList,
    tsMorphTransform: (project, sourceFile, classDeclaration, controllerName1, moduleSourceFile, dto) => (
      {
        ...coerceUpstreamOperationImplementation(sourceFile, classDeclaration, moduleSourceFile, dto, {
          ...options,
          propertyList,
          paramList,
          operationName,
          nestModule,
        }),
        ...tsMorphTransform(project, sourceFile, classDeclaration, controllerName1, moduleSourceFile, dto) ?? {},
      }
    ),
  });

}
