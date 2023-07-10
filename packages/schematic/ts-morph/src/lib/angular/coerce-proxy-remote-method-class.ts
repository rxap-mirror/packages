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
import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceProxyRemoteMethodClassOptions {
  name: string;
  project: string;
  feature: string;
  shared: boolean;
  directory: string;
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
  let {name, tsMorphTransform, sourceType, targetType, proxyMethod} = options;
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
          arguments: [w => w.quote(CoerceSuffix(name, '-proxy'))],
        },
      ],
      ctors: [{
        parameters: [{
          name: 'method',
          type: proxyMethod,
          decorators: [{
            name: 'Inject',
            arguments: [proxyMethod],
          }],
        }],
        statements: ['super(method);'],
      }],
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
      moduleSpecifier: '@rxap/rxjs',
      namedImports: ['Method'],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: ['Injectable', 'Inject'],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/remote-method',
      namedImports: ['RxapRemoteMethod', 'ProxyRemoteMethod'],
    });
    const methodStructure = tsMorphTransform!(project, sourceFile, classDeclaration);
    methodStructure.parameters ??= [{name: 'source', type: sourceType}];
    methodStructure.statements ??= ['return source as any'];
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
    CoerceClassMethod(classDeclaration, 'transformParameters', methodStructure);
  });
}
