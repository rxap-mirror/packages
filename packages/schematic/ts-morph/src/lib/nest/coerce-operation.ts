import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  classify,
  OverwriteOptions,
} from '@rxap/schematics-utilities';
import {
  CoerceImports,
  CoerceNestModuleImport,
  CoerceNestModuleProvider,
  CoerceOperationParamList,
  CoercePropertyDeclaration,
  IsNormalizedOpenApiUpstreamOptions,
  NormalizedUpstreamOptions,
  OperationIdToCommandClassImportPath,
  OperationIdToCommandClassName,
} from '@rxap/ts-morph';
import {
  camelize,
  coerceArray,
  CoercePrefix,
  CoerceSuffix,
  dasherize,
  noop,
} from '@rxap/utilities';
import { TsMorphNestProjectTransformOptions } from '@rxap/workspace-ts-morph';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { TsMorphNestProjectTransformRule } from '../ts-morph-transform';
import {
  AddOperationToController,
  OperationOptions,
  OperationParameter,
} from './add-operation-to-controller';
import { BuildNestControllerName } from './build-nest-controller-name';
import {
  CoerceDtoClass,
  CoerceDtoClassOutput,
} from './coerce-dto-class';
import { CoerceNestController } from './coerce-nest-controller';
import { DtoClassProperty } from './dto-class-property';

export interface CoerceOperationOptions<Options = Record<string, any>> extends TsMorphNestProjectTransformOptions {
  controllerName: string;
  shared?: boolean;
  nestModule?: string | null;
  skipCoerce?: boolean;
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
  ) => Partial<OperationOptions>,
  operationName: string,
  path?: string,
  controllerPath?: string,
  /**
   * true - the control path is overwritten with
   */
  overwriteControllerPath?: boolean;
  context?: string | null;
  coerceUpstreamOperationImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => TransformOperation;
  buildUpstreamGetParametersImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => TransformOperation<string | WriterFunction>;
  buildDtoReturnImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => TransformOperation;
  builtDtoDataMapperImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => TransformOperation<string | WriterFunction>;
  buildUpstreamGetDataImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => TransformOperation<void>;
  coerceOperationDtoClass?: (
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    options: Readonly<CoerceOperationOptions & Options>,
  ) => CoerceDtoClassOutput | null;
  buildOperationDtoClassName?: (controllerName: string, options: Readonly<Pick<CoerceOperationOptions, 'dtoClassNameSuffix' | 'dtoClassName'>>) => string;
  upstream?: NormalizedUpstreamOptions | null;
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
  isReturnVoid?: boolean,
  dtoClassNameSuffix?: string;
  dtoClassName?: string;
  overwrite: OverwriteOptions;
}

export function CoerceUpstreamBasicOperationImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  upstream: NormalizedUpstreamOptions,
): { className: string, memberName: string } {
  if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
    const sourceFile = classDeclaration.getSourceFile();
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
      hasExclamationToken: true,
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

export function BuildOperationDtoClassName(controllerName: string, options: Readonly<Pick<CoerceOperationOptions, 'dtoClassNameSuffix' | 'dtoClassName'>>,) {
  const {
    dtoClassNameSuffix,
    dtoClassName,
  } = options;
  return dtoClassName ?? (
    dtoClassNameSuffix ? CoerceSuffix(controllerName, CoercePrefix(dtoClassNameSuffix, '-')) : controllerName
  );
}

export function CoerceOperationDtoClass(
  classDeclaration: ClassDeclaration,
  controllerName: string,
  moduleSourceFile: SourceFile,
  options: Readonly<CoerceOperationOptions>,
): CoerceDtoClassOutput | null {
  const sourceFile = classDeclaration.getSourceFile();
  const project = sourceFile.getProject();
  const {
    dtoClassNameSuffix,
    dtoClassName,
    propertyList = [],
    isReturnVoid,
    buildOperationDtoClassName = BuildOperationDtoClassName
  } = options;
  let dto: CoerceDtoClassOutput | null = null;
  if (propertyList.length > 0 || isReturnVoid === false || dtoClassNameSuffix || dtoClassName) {
    dto = CoerceDtoClass({
      project,
      name: buildOperationDtoClassName(controllerName, options),
      propertyList,
    });
  }

  return dto;
}

export type TransformOperation<T = void> = (operationOptions: OperationOptions) => T;

export function BuiltDtoDataMapperImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation<string | WriterFunction> {
  const {
    propertyList = [],
    upstream,
    isArray,
  } = options;
  return () => {
    if (upstream) {
      const mapper: Record<string, string | WriterFunction> = {};
      for (const property of propertyList) {
        mapper[property.name] = `data.${ property.source ?? property.name }`;
      }
      if (isArray) {
        return w => {
          w.write('data.map(item => (');
          Writers.object(mapper)(w);
          w.write('))');
        };
      } else {
        return Writers.object(mapper);
      }
    } else {
      return isArray ? '[]' : '{}';
    }
  };
}

export function BuildDtoReturnImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation {
  return (operationOptions: OperationOptions) => {
    const {
      isArray,
      isReturnVoid = !dto,
      builtDtoDataMapperImplementation = BuiltDtoDataMapperImplementation,
    } = options;
    if (!isReturnVoid && dto) {
      const sourceFile = classDeclaration.getSourceFile();
      CoerceImports(sourceFile, {
        namedImports: [ isArray ? 'ToDtoInstanceList' : 'ToDtoInstance' ],
        moduleSpecifier: '@rxap/nest-dto',
      });
      const mapper = builtDtoDataMapperImplementation(classDeclaration, moduleSourceFile, dto, options)(operationOptions);
      operationOptions.returnType = dto.className + (
        isArray ? '[]' : ''
      );
      operationOptions.statements ??= [];
      operationOptions.statements = coerceArray(operationOptions.statements);
      if (isArray) {
        operationOptions.statements.push('return ToDtoInstanceList(');
      } else {
        operationOptions.statements.push('return ToDtoInstance(');
      }
      operationOptions.statements.push(
        dto.className + ',',
        w => {
          if (typeof mapper === 'string') {
            w.write(mapper);
          } else {
            mapper(w);
          }
          w.write(',');
        },
        ');',
      );
    }
  };
}

export function BuildUpstreamGetDataImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation {
  return (operationOptions) => {
    const {
      buildUpstreamGetParametersImplementation = (() => () => ''),
      upstream,
    } = options;
    if (upstream) {
      if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
        const { memberName: commandMemberName } = CoerceUpstreamBasicOperationImplementation(
          classDeclaration, moduleSourceFile, upstream);
        const commandParameter = buildUpstreamGetParametersImplementation(
          classDeclaration, moduleSourceFile, dto, options)(operationOptions);
        operationOptions.statements ??= [];
        operationOptions.statements = coerceArray(operationOptions.statements);
        operationOptions.statements.push(w => {
          w.write(`const data = await this.${ commandMemberName }.execute(`);
          if (typeof commandParameter === 'function') {
            commandParameter(w);
          } else {
            w.write(commandParameter);
          }
          w.write(');');
        });
      }
    }
  };
}

export function CoerceUpstreamDefaultOperationImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation {
  return (operationOptions: OperationOptions) => {
    const {
      upstream,
      buildDtoReturnImplementation = BuildDtoReturnImplementation,
      buildUpstreamGetDataImplementation = BuildUpstreamGetDataImplementation,
    } = options;
    if (upstream) {
      operationOptions.isAsync = true;
      buildUpstreamGetDataImplementation(classDeclaration, moduleSourceFile, dto, options)(operationOptions);
    }
    buildDtoReturnImplementation(classDeclaration, moduleSourceFile, dto, options)(operationOptions);
  };
}

export function CoerceOperation<Options = Record<string, any>>(options: CoerceOperationOptions<Options>): Rule {
  const {
    controllerName,
    project,
    paramList = [],
    feature,
    shared,
    tsMorphTransform = noop,
    operationName,
    skipCoerce,
    controllerPath,
    queryList = [],
    coerceUpstreamOperationImplementation = CoerceUpstreamDefaultOperationImplementation,
    coerceOperationDtoClass = CoerceOperationDtoClass,
  } = options;
  let { nestModule, directory, path } = options;


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

  const nestController = BuildNestControllerName({
    controllerName,
    nestModule,
  });

  if (!nestModule || isFirstBornSibling) {
    nestModule = nestController;
  }

  directory = join(directory ?? '', nestModule!);

  const operationPathParameters = paramList.filter(p => !p.fromParent).map(p => p.name);

  if (operationPathParameters.length) {
    if (!path) {
      path = operationPathParameters.map(p => `:${ p }`).join('/');
    } else {
      const notFound = operationPathParameters.filter(p => !path!.includes(p));
      path += '/' + notFound.map(p => `:${ p }`).join('/');
    }
  }

  return chain([
    () => console.log(`Coerce Operation '${ operationName }' with path '${ path ?? '<empty>' }' in the controller '${ nestController }' in the module '${ nestModule }'`.blue),
    () => console.log(`Operation path parameters: ${paramList.map(p => (p.fromParent ? '^' : '') + p.name).join(', ')}`.grey),
    CoerceNestController({
      project,
      feature,
      shared,
      directory,
      coerceModule: !skipCoerce,
      name: nestController,
      nestModule,
    }),
    TsMorphNestProjectTransformRule({
      project,
      feature,
      shared,
      directory,
      // must be set to false are some specializations of this function need to access more files then only the
      // controller and module source file
      filter: false,
    }, (project, [controllerSourceFile, moduleSourceFile]) => {

      const classDeclaration = controllerSourceFile.getClassOrThrow(`${ classify(nestController) }Controller`);

      const dto = coerceOperationDtoClass(classDeclaration, nestController, moduleSourceFile, options as any);

      if (dto) {
        CoerceImports(controllerSourceFile, {
          namedImports: [ dto.className ],
          moduleSpecifier: dto.filePath,
        });
      }

      let operationOptions: OperationOptions = {};

      coerceUpstreamOperationImplementation(classDeclaration, moduleSourceFile, dto, options as any)(operationOptions);

      operationOptions = {
        ...operationOptions,
        ...tsMorphTransform(project, controllerSourceFile, classDeclaration, nestController, moduleSourceFile, dto) ?? {}
      };

      if (controllerPath) {
        console.log(`Overwrite controller path with '${ controllerPath }' for operation '${ operationName }' in controller '${ nestController }' in module '${ nestModule }'`.yellow);
        classDeclaration.getDecoratorOrThrow('Controller').set({
          arguments: [ w => w.quote(controllerPath) ],
        });
      } else if (!isFirstBornSibling) {
        const parentParamList = paramList.filter(p => p.fromParent);
        classDeclaration.getDecoratorOrThrow('Controller').set({
          arguments: [
            w => w.quote(`${ nestModule }/${ parentParamList.length ?
              parentParamList.map(param => `:${ param.name }`).join('/') + '/' :
              '' }${ controllerName.replace(nestModule + '-', '') }`),
          ],
        });
      }

      CoerceOperationParamList(paramList, classDeclaration);

      AddOperationToController(
        controllerSourceFile,
        classDeclaration,
        operationName,
        {
          isAsync: true,
          paramList,
          queryList,
          path,
          ...operationOptions,
        },
      );

    }, [`${ nestController }.controller.ts?`, `${ dasherize(nestModule!) }.module.ts?`]),
  ]);


}
