import {
  ClassDeclaration,
  MethodDeclarationStructure,
  Project,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import {
  CoerceClass,
  CoerceSourceFile,
} from '@rxap/schematics-ts-morph';
import { CoerceClassMethod } from '../nest/coerce-class-method';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceProxyRemoteMethodClassOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  override?: boolean;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
  ) => Partial<MethodDeclarationStructure>;
  sourceType: string | WriterFunction;
  targetType: string | WriterFunction;
  proxyMethod: string | WriterFunction;
}

export function CoerceProxyRemoteMethodClass(options: CoerceProxyRemoteMethodClassOptions) {
  let {
    override,
    name,
    tsMorphTransform,
    sourceType,
    targetType,
    proxyMethod,
  } = options;
  tsMorphTransform ??= () => ({});
  const className = classify(CoerceSuffix(name, 'ProxyMethod'));
  const fileName = CoerceSuffix(name, '-proxy.method.ts');
  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, fileName);
    const classDeclaration = CoerceClass(sourceFile, className, {
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: [],
        },
        {
          name: 'RxapRemoteMethod',
          arguments: [ w => w.quote(CoerceSuffix(name, '-proxy')) ],
        },
      ],
      ctors: [
        {
          parameters: [
            {
              name: 'method',
              type: proxyMethod,
              decorators: [
                {
                  name: 'Inject',
                  arguments: [ proxyMethod ],
                },
              ],
            },
          ],
          statements: [ 'super(method);' ],
        },
      ],
      extends: w => {
        w.write('ProxyRemoteMethod<');
        if (typeof sourceType === 'string') {
          w.write(sourceType);
        } else {
          sourceType(w);
        }
        w.write(', ');
        if (typeof targetType === 'string') {
          w.write(targetType);
        } else {
          targetType(w);
        }
        w.write('>');
      },
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/utilities/rxjs',
      namedImports: [ 'Method' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Injectable', 'Inject' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/remote-method',
      namedImports: [ 'RxapRemoteMethod', 'ProxyRemoteMethod' ],
    });
    const methodStructure = tsMorphTransform(project, sourceFile, classDeclaration);
    methodStructure.parameters ??= [
      {
        name: 'source',
        type: sourceType,
      },
    ];
    methodStructure.statements ??= [ 'return source as any' ];
    methodStructure.returnType ??= w => {
      w.write('Promise<');
      if (typeof targetType ===
        'string') {
        w.write(targetType);
      } else {
        targetType(w);
      }
      w.write('>');
    };
    methodStructure.isAsync ??= true;
    const methodDeclaration = CoerceClassMethod(classDeclaration, 'transformParameters', methodStructure);
    if (override) {
      methodDeclaration.set(methodStructure);
    }
  });
}
