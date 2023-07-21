import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceSourceFile } from '../coerce-source-file';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceMethodClassOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  overwrite?: boolean;
  providedIn?: string;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
  ) => Partial<Omit<OptionalKind<MethodDeclarationStructure>, 'name'>>;
}

export function CoerceMethodClass(options: CoerceMethodClassOptions) {
  let {
    overwrite,
    name,
    tsMorphTransform,
    providedIn,
  } = options;
  tsMorphTransform ??= () => ({});
  const className = classify(CoerceSuffix(name, 'Method'));
  const fileName = CoerceSuffix(name, '.method.ts');
  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, fileName);
    const classDeclaration = CoerceClass(sourceFile, className, {
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: providedIn ? [ Writers.object({ providedIn }) ] : [],
        },
      ],
      implements: [ 'Method' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/pattern',
      namedImports: [ 'Method' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Injectable' ],
    });
    const methodStructure = tsMorphTransform!(project, sourceFile, classDeclaration);
    methodStructure.parameters ??= [
      {
        name: 'parameters',
        hasQuestionToken: true,
        type: 'any',
      },
    ];
    methodStructure.returnType ??= 'any';
    const methodDeclaration = CoerceClassMethod(classDeclaration, 'call', methodStructure);
    if (overwrite) {
      methodDeclaration.set(methodStructure);
    }
  });
}
