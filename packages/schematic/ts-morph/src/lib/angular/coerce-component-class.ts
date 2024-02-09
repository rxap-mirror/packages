import { CoerceComponent } from '@rxap/ts-morph';
import {
  ArrayLiteralExpression,
  ClassDeclaration,
  ObjectLiteralExpression,
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceSourceFile } from '../coerce-source-file';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';

export interface CoerceComponentClassRuleOptions extends TsMorphAngularProjectTransformOptions {
  componentName: string;
  selector?: string;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    componentDecoratorObject: ObjectLiteralExpression,
    providersArray: ArrayLiteralExpression,
    importsArray: ArrayLiteralExpression,
  ) => void;
}

export function CoerceComponentClassRule(options: Readonly<CoerceComponentClassRuleOptions>) {
  const {
    componentName,
    selector,
    tsMorphTransform,
  } = options;

  return TsMorphAngularProjectTransformRule(options, (project) => {

    const sourceFile = CoerceSourceFile(project, `/${ componentName }.component.ts`);

    const { classDeclaration, componentDecoratorObject, providersArray, importsArray } = CoerceComponent(sourceFile, componentName, { selector, styleUrls: true, templateUrl: true });

    tsMorphTransform?.(project, sourceFile, classDeclaration, componentDecoratorObject, providersArray, importsArray);

  });

}
