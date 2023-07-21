import {
  ClassDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import { CoerceClassMethod } from '../nest/coerce-class-method';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceClass } from '../coerce-class';

export interface CoerceMethodClassOptions extends TsMorphAngularProjectTransformOptions {
  name: string;
  override?: boolean;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
  ) => Partial<Omit<OptionalKind<MethodDeclarationStructure>, 'name'>>;
}

export function CoerceMethodClass(options: CoerceMethodClassOptions) {
  let {
    override,
    name,
    tsMorphTransform,
  } = options;
  tsMorphTransform ??= () => ({});
  const className = classify(CoerceSuffix(name, 'Method'));
  const fileName = CoerceSuffix(name, '.method.ts');
  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = CoerceSourceFile(project, fileName);
    const classDeclaration = CoerceClass(sourceFile, className, {
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: [],
        },
      ],
      implements: [ 'Method' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/utilities/rxjs',
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
    if (override) {
      methodDeclaration.set(methodStructure);
    }
  });
}
