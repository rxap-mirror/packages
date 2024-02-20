import {
  camelize,
  capitalize,
} from '@rxap/schematics-utilities';
import { TypeImport } from '@rxap/ts-morph';
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
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceStatements } from '../ts-morph/coerce-statements';
import { WriteType } from '@rxap/ts-morph';

export interface OperationParameter {
  name: string;
  type?: string | WriterFunction | TypeImport;
  pipeList?: Array<string | WriterFunction>;
  defaultValue?: string | WriterFunction;
  hasQuestionToken?: boolean;
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

export interface OperationOptions {
  path?: string,
  returnType?: string | WriterFunction,
  isAsync?: boolean,
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  method?: string,

  body?: string | WriterFunction,
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction;
  decorators?: OptionalKind<DecoratorStructure>[];
  tsMorphTransform?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    methodDeclaration: MethodDeclaration,
    options: OperationOptions,
  ) => void,
}

function buildMethodQueryParameters(
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
    }).map(query => ({
      name: query.alias ??
        query.name,
      type: query.type ? WriteType({ type: query.type, isArray: false }, sourceFile) : undefined,
      hasQuestionToken: query.hasQuestionToken ?? (
        !query.required && query.defaultValue === undefined
      ),
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

function buildMethodParamParameters(paramList: OperationParameter[], sourceFile: SourceFile): Array<OptionalKind<ParameterDeclarationStructure>> {
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

export function AddOperationToController(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  name: string,
  options: OperationOptions,
): void {

  let {
    method,
    path,
    returnType,
    isAsync,
    paramList,
    queryList,
    body,
    statements,
    decorators,
    tsMorphTransform,
  } = options;

  queryList ??= [];
  paramList ??= [];
  decorators ??= [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};
  method ??= 'get';
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
      namedImports: [ method, 'NotImplementedException' ],
      moduleSpecifier: '@nestjs/common',
    },
  ];

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

  returnType ??= 'void';

  const methodDeclaration = CoerceClassMethod(
    classDeclaration,
    camelize(name),
    {
      scope: Scope.Public,
      isAsync,
      parameters: [
        ...buildMethodQueryParameters(queryList, sourceFile),
        ...buildMethodParamParameters(paramList, sourceFile),
        ...buildMethodBodyParameters(body),
      ].sort((a, b) => {
        if (a.hasQuestionToken && b.hasQuestionToken) {
          return 0;
        }
        return a.hasQuestionToken ? 1 : -1;
      }),
      returnType: !isAsync ? returnType : returnType ? (w: any) => {
        w.write('Promise<');
        if (typeof returnType === 'string') {
          w.write(returnType);
        } else if (typeof returnType === 'function') {
          returnType(w);
        } else {
          throw new Error('Invalid return type. Must be a string or a function');
        }
        w.write('>');
      } : undefined,
    },
  );

  decorators.forEach(decorator => {
    CoerceDecorator(methodDeclaration, decorator.name, decorator);
  });

  CoerceDecorator(methodDeclaration, method, { arguments: path ? [ w => w.quote(path!) ] : [] });
  coerceApiQueryDecorators(queryList, methodDeclaration);
  CoerceStatements(
    methodDeclaration,
    statements ??
    [ 'throw new NotImplementedException();' ],
  );

  CoerceImports(sourceFile, importStructures);

  tsMorphTransform(sourceFile, classDeclaration, methodDeclaration, options);

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
