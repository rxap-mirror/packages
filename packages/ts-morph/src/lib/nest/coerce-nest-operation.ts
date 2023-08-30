import {
  camelize,
  capitalize,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  DecoratorStructure,
  ImportDeclarationStructure,
  MethodDeclaration,
  ObjectLiteralExpression,
  OptionalKind,
  ParameterDeclarationStructure,
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
import { CoerceStatements } from '../coerce-statements';
import { GetControllerClass } from './get-controller-class';

export interface OperationParameter {
  name: string;
  type?: string | WriterFunction;
  pipeList?: Array<string | WriterFunction>;
  defaultValue?: string | WriterFunction;
  required?: boolean;
  isArray?: boolean;

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

export interface CoerceOperationOptions {
  controllerName?: string;
  tsMorphTransform?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    methodDeclaration: MethodDeclaration,
    options: CoerceOperationOptions,
  ) => void,
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  operationName: string,
  path?: string,
  returnType?: string | WriterFunction,
  isAsync?: boolean,
  method?: string,
  body?: string | WriterFunction,
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction;
  decorators?: OptionalKind<DecoratorStructure>[];
}

function buildMethodQueryParameters(
  queryList: OperationParameter[],
  importStructures: Array<OptionalKind<ImportDeclarationStructure>>,
): Array<OptionalKind<ParameterDeclarationStructure>> {
  if (queryList.length) {
    return queryList.map(query => {
      if (query.defaultValue ===
        undefined) {
        return query;
      }
      importStructures.push({
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
    }).map(query => ({
      name: query.alias ??
        query.name,
      type: query.type,
      hasQuestionToken: !query.required &&
        query.defaultValue ===
        undefined,
      decorators: [
        {
          name: 'Query',
          arguments: [
            w => w.quote(query.name),
            ...(query.pipeList ??
              []),
          ],
        },
      ],
    }));
  }
  return [];
}

function buildMethodParamParameters(paramList: OperationParameter[]): Array<OptionalKind<ParameterDeclarationStructure>> {
  if (paramList.length) {
    return paramList.map(param => ({
      name: param.alias ??
        param.name,
      type: param.type,
      decorators: [
        {
          name: 'Param',
          arguments: [ w => w.quote(param.name) ],
        },
      ],
    }));
  }
  return [];
}

function buildMethodBodyParameters(body: string | WriterFunction | undefined): Array<OptionalKind<ParameterDeclarationStructure>> {
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

function coerceApiQueryDecorators(queryList: OperationParameter[], methodDeclaration: MethodDeclaration) {

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

export function CoerceNestOperation(sourceFile: SourceFile, options: CoerceOperationOptions) {

  const {
    operationName,
    queryList = [],
    paramList = [],
    tsMorphTransform = () => void 0,

    returnType = 'void',
    isAsync,
    body,
    decorators = [],
  } = options;

  let {
    method = 'get',
    path,
    statements,
  } = options;

  const classDeclaration = GetControllerClass(sourceFile);

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
      parameters: [
        ...buildMethodQueryParameters(queryList, importStructures),
        ...buildMethodParamParameters(paramList),
        ...buildMethodBodyParameters(body),
      ].sort((a, b) => {
        if (a.hasQuestionToken && b.hasQuestionToken) {
          return 0;
        }
        return a.hasQuestionToken ? 1 : -1;
      }),
    },
  );

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

  CoerceDecorator(methodDeclaration, method, { arguments: path ? [ w => w.quote(path!) ] : [] })
    .set({ arguments: path ? [ w => w.quote(path!) ] : [] });
  coerceApiQueryDecorators(queryList, methodDeclaration);
  CoerceStatements(
    methodDeclaration,
    statements,
  );

  CoerceImports(sourceFile, importStructures);

  tsMorphTransform(sourceFile, classDeclaration, methodDeclaration, options);

  return methodDeclaration;

}
