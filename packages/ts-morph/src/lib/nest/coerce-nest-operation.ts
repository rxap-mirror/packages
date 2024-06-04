import {
  camelize,
  capitalize,
  coerceArray,
  CoerceArrayItems,
  CoercePrefix,
  CoerceSuffix,
  dasherize,
  noop,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  DecoratorStructure,
  ImportDeclarationStructure,
  MethodDeclaration,
  ObjectLiteralExpression,
  OptionalKind,
  ParameterDeclarationStructure,
  Project,
  PropertyAssignment,
  Scope,
  SourceFile,
  StatementStructures,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';
import { CoercePropertyDeclaration } from '../coerce-property-declaration';
import { CoerceStatements } from '../coerce-statements';
import { DataProperty } from '../data-property';
import { OverwriteOptions } from '../overwrite-options';
import { TypeImport } from '../type-import';
import {
  IsNormalizedOpenApiUpstreamOptions,
  NormalizedUpstreamOptions,
} from '../upstream-options';
import { WriteType } from '../write-type';
import {
  CoerceDtoClass,
  CoerceDtoClassOutput,
} from './coerce-dto-class';
import { CoerceNestModuleImport } from './coerce-nest-module-import';
import { CoerceNestModuleProvider } from './coerce-nest-module-provider';
import { DtoClassProperty } from './dto-class-property';
import { FindNestModuleSourceFile } from './find-nest-module-source-file';
import { GetControllerClass } from './get-controller-class';
import {
  OperationIdToCommandClassImportPath,
  OperationIdToCommandClassName,
} from './operation-id-utilities';

export interface OperationParameter extends DataProperty {
  type?: string | WriterFunction | TypeImport;
  pipeList?: Array<string | WriterFunction | TypeImport>;
  defaultValue?: string | WriterFunction;
  hasQuestionToken?: boolean;
  required?: boolean;

  /**
   * (optional) the method parameter name. If not defined the name property will be used
   */
  alias?: string;

  /**
   * true - the parameter is a parent parameter.
   * Example
   * @Controller('/user/:uuid')
   * ...
   * @Get('/profile')
   *
   * In this case the uuid parameter should not be added to the operation path.
   *
   */
  fromParent?: boolean;
}

export interface OperationOptions {
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  operationName: string,
  path?: string | null,
  returnType?: string | WriterFunction,
  isAsync?: boolean,
  method?: string,
  body?: string | WriterFunction | null,
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction | null;
  decorators?: OptionalKind<DecoratorStructure>[];
}

export interface CoerceOperationOptions extends OperationOptions {
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>
  ) => Partial<OperationOptions> | void,
  overwrite?: OverwriteOptions;

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
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation;
  buildUpstreamGetParametersImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation<string | WriterFunction>;
  buildDtoReturnImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation;
  builtDtoDataMapperImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation<string | WriterFunction>;
  buildUpstreamGetDataImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation<void>;
  buildGetDataImplementation?: (
    classDeclaration: ClassDeclaration,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput | null,
    options: Readonly<CoerceOperationOptions & any>,
  ) => TransformOperation<void>;
  coerceOperationDtoClass?: (
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    options: Readonly<CoerceOperationOptions & any>,
  ) => CoerceDtoClassOutput | null;
  buildOperationDtoClassName?: (controllerName: string, options: Readonly<Pick<CoerceOperationOptions, 'dtoClassNameSuffix' | 'dtoClassName'>>) => string;
  upstream?: NormalizedUpstreamOptions | null;
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
  isReturnVoid?: boolean,
  dtoClassNameSuffix?: string;
  dtoClassName?: string;
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
  return (operationOptions: OperationOptions) => {
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
      buildGetDataImplementation = noop,
    } = options;
    buildGetDataImplementation(classDeclaration, moduleSourceFile, dto, options)?.(operationOptions);
    if (upstream) {
      operationOptions.isAsync = true;
      buildUpstreamGetDataImplementation(classDeclaration, moduleSourceFile, dto, options)(operationOptions);
    }
    buildDtoReturnImplementation(classDeclaration, moduleSourceFile, dto, options)(operationOptions);
  };
}

export function BuildMethodQueryParameters(
  queryList: OperationParameter[],
  sourceFile: SourceFile,
): Array<OptionalKind<ParameterDeclarationStructure>> {
  if (queryList.length) {
    return queryList.map(query => {
      if (query.defaultValue ===
          undefined) {
        return query;
      }
      CoerceImports(sourceFile,{
        namedImports: [ 'DefaultValuePipe' ],
        moduleSpecifier: '@nestjs/common',
      });
      const pipeList = query.pipeList?.slice() ?? [];
      pipeList.push(w => {
        w.write('new DefaultValuePipe(');
        if (typeof query.defaultValue === 'string') {
          w.write(query.defaultValue);
        } else if (typeof query.defaultValue === 'function') {
          query.defaultValue(w);
        } else {
          throw new Error('Invalid default value. Must be a string or a function');
        }
        w.write(')');
      });
      return {
        ...query,
        pipeList,
      };
    }).map(({
      alias,
      name,
      type,
      hasQuestionToken,
      required,
      defaultValue,
      pipeList = [],
      isArray
    }) => ({
      name: alias ?? name,
      type: WriteType({ type: type ?? 'unknown', isArray: isArray }, sourceFile),
      hasQuestionToken: hasQuestionToken ?? (
        !required && defaultValue === undefined
      ),
      decorators: [
        {
          name: 'Query',
          arguments: [
            w => w.quote(name),
            ...pipeList.map(pipe => {
              if (typeof pipe === 'string') {
                return pipe;
              }
              if (typeof pipe === 'function') {
                return pipe;
              }
              return WriteType(pipe, sourceFile);
            }),
          ],
        },
      ],
    }));
  }
  return [];
}

export function BuildMethodParamParameters(
  paramList: OperationParameter[],
  sourceFile: SourceFile,
): Array<OptionalKind<ParameterDeclarationStructure>> {
  if (paramList.length) {
    return paramList.map(({ alias, name, type }) => ({
      name: alias ?? name,
      type: type ? WriteType({
        type: type,
        isArray: false
      }, sourceFile) : undefined,
      decorators: [
        {
          name: 'Param',
          arguments: [ w => w.quote(name) ],
        },
      ],
    }));
  }
  return [];
}

export function BuildMethodBodyParameters(body: string | WriterFunction | undefined | null): Array<OptionalKind<ParameterDeclarationStructure>> {
  if (body) {
    return [
      {
        name: 'body',
        type: body,
        decorators: [
          {
            name: 'Body',
            arguments: [],
          },
        ],
      },
    ];
  }
  return [];
}

export function CoerceApiQueryDecorators(queryList: OperationParameter[], methodDeclaration: MethodDeclaration) {

  for (const query of queryList) {

    CoerceDecorator(
      methodDeclaration,
      'ApiQuery',
      {
        arguments: [
          Writers.object({
            name: w => w.quote(query.name),
            required: query.required ? 'true' : 'false',
            isArray: query.isArray ? 'true' : 'false',
          }),
        ],
      },
      () => decorator => {
        if (decorator.getArguments().length) {
          const [ objectLiteralExpression ] = decorator.getArguments();
          if (objectLiteralExpression instanceof ObjectLiteralExpression) {
            const namePropertyElement = objectLiteralExpression.getProperty('name');
            if (namePropertyElement instanceof PropertyAssignment) {
              const name = namePropertyElement.getInitializer()?.getText().trim().replace(/^'/, '').replace(/'$/, '');
              return name === query.name;
            }
          }
        }
        return false;
      },
    );

  }

}

export function CoerceOperationParamList(paramList: OperationParameter[], classDeclaration: ClassDeclaration) {
  const currentControllerPath = classDeclaration.getDecoratorOrThrow('Controller').getArguments()[0]?.getText() ?? '';
  const fragments = currentControllerPath.split('/');
  const parameters = fragments.filter(fragment => fragment.startsWith(':'));
  for (const parameter of parameters) {
    if (!paramList.some(param => param.name === parameter.substr(1))) {
      paramList.push({ name: parameter.substr(1) });
    }
  }
}

export function CoerceNestOperation(sourceFile: SourceFile, options: CoerceOperationOptions, moduleSourceFile?: SourceFile) {

  const project = sourceFile.getProject();
  if (!moduleSourceFile) {
    moduleSourceFile = FindNestModuleSourceFile(project, sourceFile.getDirectoryPath());
    if (!moduleSourceFile) {
      throw new Error(`Could not find Nest module in '${ sourceFile.getDirectoryPath() }'`);
    }
  }

  const {
    tsMorphTransform = () => void 0,
    coerceUpstreamOperationImplementation = CoerceUpstreamDefaultOperationImplementation,
    coerceOperationDtoClass = CoerceOperationDtoClass,
    overwrite,
    controllerPath,
  } = options;

  const moduleName = dasherize(moduleSourceFile.getClasses()[0].getName()!.replace(/Module$/, ''));
  const classDeclaration = GetControllerClass(sourceFile);
  const controllerName = dasherize(classDeclaration.getName()!.replace(/Controller$/, ''));

  const dto = coerceOperationDtoClass(classDeclaration, controllerName, moduleSourceFile, options as any);

  if (dto) {
    CoerceImports(sourceFile, {
      namedImports: [ dto.className ],
      moduleSpecifier: dto.filePath,
    });
  }

  const operationOptions: Required<OperationOptions> = {
    paramList: options.paramList ?? [],
    queryList: options.queryList ?? [],
    operationName: options.operationName,
    path: options.path ?? null,
    returnType: options.returnType ?? 'void',
    isAsync: options.isAsync ?? true,
    method: options.method ?? 'get',
    body: options.body ?? null,
    statements: options.statements ?? null,
    decorators: options.decorators ?? [],
  };

  coerceUpstreamOperationImplementation(classDeclaration, moduleSourceFile, dto, options as any)(operationOptions);

  Object.assign(
    operationOptions,
    tsMorphTransform(project, sourceFile, classDeclaration, controllerName, moduleSourceFile, dto, options) ?? {}
  );

  const {
    paramList,
    queryList,
    operationName,
    returnType,
    isAsync,
    body,
    decorators,
  } = operationOptions;

  let {
    path,
    statements,
    method,
  } = operationOptions;

  if (controllerPath) {
    console.log(`Overwrite controller path with '${ controllerPath }' for operation '${ operationName }' in controller '${ controllerName }' in module '${ moduleName }'`.yellow);
    classDeclaration.getDecoratorOrThrow('Controller').set({
      arguments: [ w => w.quote(controllerPath) ],
    });
  } else if (moduleName !== controllerName) {
    const parentParamList = paramList.filter(p => p.fromParent);
    classDeclaration.getDecoratorOrThrow('Controller').set({
      arguments: [
        w => w.quote(`${ moduleName }/${ parentParamList.length ?
                                         parentParamList.map(param => `:${ param.name }`).join('/') + '/' :
                                         '' }${ controllerName.replace(moduleName + '-', '') }`),
      ],
    });
  }

  CoerceOperationParamList(paramList, classDeclaration);

  method = capitalize(method.toLowerCase());

  queryList.forEach(query => {
    query.name = camelize(query.name);
    if (query.alias) {
      query.alias = camelize(query.alias);
    }
    query.type ??= 'string';
  });
  paramList.forEach(param => {
    param.name = camelize(param.name);
    if (param.alias) {
      param.alias = camelize(param.alias);
    }
    param.type ??= 'string';
  });

  const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
    {
      namedImports: [ method ],
      moduleSpecifier: '@nestjs/common',
    },
  ];

  if (!statements) {
    statements = [ 'throw new NotImplementedException();' ];
    importStructures.push({
      namedImports: [ 'NotImplementedException' ],
      moduleSpecifier: '@nestjs/common',
    });
  }

  if (queryList.length) {
    importStructures.push({
      namedImports: [ 'Query' ],
      moduleSpecifier: '@nestjs/common',
    });
    importStructures.push({
      namedImports: [ 'ApiQuery' ],
      moduleSpecifier: '@nestjs/swagger',
    });
  }

  if (paramList.length) {
    importStructures.push({
      namedImports: [ 'Param' ],
      moduleSpecifier: '@nestjs/common',
    });
  }

  if (body) {
    importStructures.push({
      namedImports: [ 'Body' ],
      moduleSpecifier: '@nestjs/common',
    });
  }

  if (!path) {
    if (paramList.filter(param => !param.fromParent).length) {
      path = paramList.filter(param => !param.fromParent).map(param => `:${ param.name }`).join('/');
    }
  } else {
    const match = path.match(/:(\w+)/g);
    for (const param of match ?? []) {
      if (!paramList.find(p => p.name === param.substr(1))) {
        paramList.push({
          name: param.substr(1),
          type: 'string',
        });
      }
    }
  }

  // TODO : check that all defined param in the paramList are present in the path
  const methodDeclaration = CoerceClassMethod(
    classDeclaration,
    camelize(operationName),
    {
      scope: Scope.Public,
      isAsync,
    },
  );

  // region coerce parameters
  const existingParameters: OptionalKind<ParameterDeclarationStructure>[] = methodDeclaration.getParameters().map(p => p.getStructure());

  CoerceArrayItems(existingParameters, [
    ...BuildMethodQueryParameters(queryList, sourceFile),
    ...BuildMethodParamParameters(paramList, sourceFile),
    ...BuildMethodBodyParameters(body),
  ], (a, b) => a.name === b.name);

  methodDeclaration.getParameters().forEach(p => p.remove());

  function sortByName(a: OptionalKind<ParameterDeclarationStructure>, b: OptionalKind<ParameterDeclarationStructure>) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  function sortByOptional(a: OptionalKind<ParameterDeclarationStructure>, b: OptionalKind<ParameterDeclarationStructure>) {
    if (a.hasQuestionToken && !b.hasQuestionToken) {
      return 1;
    }
    if (!a.hasQuestionToken && b.hasQuestionToken) {
      return -1;
    }
    return 0;
  }

  for (const parameter of existingParameters.sort(sortByName).sort(sortByOptional)) {
    methodDeclaration.addParameter(parameter);
  }
  // endregion

  if (returnType) {
    if (isAsync) {
      methodDeclaration.setReturnType(w => {
        w.write('Promise<');
        if (typeof returnType === 'string') {
          w.write(returnType);
        } else if (typeof returnType === 'function') {
          returnType(w);
        } else {
          throw new Error('Invalid return type. Must be a string or a function');
        }
        w.write('>');
      });
    } else {
      methodDeclaration.setReturnType(returnType);
    }
  }

  decorators.forEach(decorator => {
    CoerceDecorator(methodDeclaration, decorator.name, decorator);
  });

  const methodDecorator = CoerceDecorator(methodDeclaration, method, { arguments: path ? [ w => w.quote(path!) ] : [] });
  if (overwrite) {
    methodDecorator.set({ arguments: path ? [ w => w.quote(path!) ] : [] });
  }
  CoerceApiQueryDecorators(queryList, methodDeclaration);
  CoerceStatements(
    methodDeclaration,
    statements,
    Array.isArray(overwrite) ? overwrite.includes('statements') : overwrite ?? false,
  );

  CoerceImports(sourceFile, importStructures);

  return methodDeclaration;

}
