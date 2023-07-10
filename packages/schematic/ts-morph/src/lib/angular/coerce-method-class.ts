import {ClassDeclaration, MethodDeclarationStructure, OptionalKind, Project, SourceFile} from 'ts-morph';
import {classify, CoerceSuffix} from '@rxap/schematics-utilities';
import {CoerceClassMethod} from '../coerce-class-method';
import {CoerceImports} from '../ts-morph/coerce-imports';
import {CoerceSourceFile} from '../coerce-source-file';
import {CoerceClass} from '../coerce-class';
import {TsMorphAngularProjectTransform} from '../ts-morph-transform';
import {AddMethodClass, AddMethodClassOptions} from '../add-method-class';

export interface CoerceMethodClassOptions {
  name: string;
  project: string;
  feature: string;
  directory?: string;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
  ) => Partial<Omit<OptionalKind<MethodDeclarationStructure>, 'name'>>;
}

export function CoerceMethodClassLegacy(
  sourceFile: SourceFile,
  name: string,
  options: AddMethodClassOptions = {},
) {

  name = CoerceSuffix(name, 'Method');

  const hasClass = !!sourceFile.getClass(name);

  if (!hasClass) {
    AddMethodClass(sourceFile, name, options);
  }

}

export function CoerceMethodClass(options: CoerceMethodClassOptions) {
  let {name, tsMorphTransform} = options;
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
      implements: ['Method'],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/rxjs',
      namedImports: ['Method'],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: ['Injectable'],
    });
    const methodStructure = tsMorphTransform!(project, sourceFile, classDeclaration);
    methodStructure.parameters ??= [{name: 'parameters', hasQuestionToken: true, type: 'any'}];
    methodStructure.returnType ??= 'any';
    CoerceClassMethod(classDeclaration, 'call', methodStructure);
  });
}
