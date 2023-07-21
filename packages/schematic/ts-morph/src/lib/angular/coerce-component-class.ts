import { SchematicsException } from '@angular-devkit/schematics';
import { classify } from '@rxap/schematics-utilities';
import {
  ArrayLiteralExpression,
  ClassDeclaration,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceSourceFile } from '../coerce-source-file';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';

export interface CoerceComponentClassRuleOptions extends TsMorphAngularProjectTransformOptions {
  componentName: string;
  selector?: string;
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    componentDecoratorObject: ObjectLiteralExpression,
    providerArray: ArrayLiteralExpression,
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
    const classDeclaration = CoerceClass(
      sourceFile,
      classify(componentName) + 'Component', {
        isExported: true,
      },
    );
    const componentDecoratorDeclaration = CoerceDecorator(classDeclaration, 'Component', {
      arguments: [
        Writers.object({
          selector: selector ?? componentName,
          template: '',
          styles: '[]',
        }),
      ],
    });
    const componentDecoratorObject = componentDecoratorDeclaration.getArguments()[0];
    if (!componentDecoratorObject) {
      throw new SchematicsException(`Could not find component decorator object for component '${ componentName }'`);
    }
    if (!(componentDecoratorObject instanceof ObjectLiteralExpression)) {
      throw new SchematicsException(`Component decorator object for component '${ componentName }' is not an object literal expression`);
    }
    // const providerArrayDeclaration = CoercePropertyDeclaration(componentDecoratorObject, 'providers', {
    throw new Error('Not implemented yet');

  });

}
