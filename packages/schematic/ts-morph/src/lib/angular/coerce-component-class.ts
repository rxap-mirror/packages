import {TsMorphAngularProjectTransform, TsMorphAngularProjectTransformOptions} from '../ts-morph-transform';
import {
  ArrayLiteralExpression,
  ClassDeclaration,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import {classify} from '@rxap/schematics-utilities';
import {SchematicsException} from '@angular-devkit/schematics';
import {CoerceDecorator} from '../ts-morph/coerce-decorator';
import {CoerceSourceFile} from '../coerce-source-file';
import {CoerceClass} from '../coerce-class';

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
  let {componentName, selector, tsMorphTransform} = options;
  tsMorphTransform ??= () => undefined;

  return TsMorphAngularProjectTransform(options, (project: Project) => {

    const sourceFile = CoerceSourceFile(project, `/${componentName}.component.ts`);
    const classDeclaration = CoerceClass(
      sourceFile,
      classify(componentName) + 'Component', {
        isExported: true,
      },
    );
    const componentDecoratorDeclaration = CoerceDecorator(classDeclaration, 'Component', {
      arguments: [Writers.object({
        selector: selector ?? componentName,
        template: '',
        styles: '[]',
      })],
    });
    const componentDecoratorObject = componentDecoratorDeclaration.getArguments()[0];
    if (!componentDecoratorObject) {
      throw new SchematicsException(`Could not find component decorator object for component '${componentName}'`);
    }
    if (!(componentDecoratorObject instanceof ObjectLiteralExpression)) {
      throw new SchematicsException(`Component decorator object for component '${componentName}' is not an object literal expression`);
    }
    // const providerArrayDeclaration = CoercePropertyDeclaration(componentDecoratorObject, 'providers', {
    throw new Error('Not implemented yet');

  });

}
