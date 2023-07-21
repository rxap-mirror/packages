import {
  TsMorphAngularProjectTransform,
  TsMorphAngularProjectTransformOptions,
} from '../ts-morph-transform';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';

export interface EnforceUseFormControlOrderRuleOptions extends TsMorphAngularProjectTransformOptions {
  formName: string;
}

export function EnforceUseFormControlOrderRule(options: EnforceUseFormControlOrderRuleOptions) {
  const { formName } = options;
  const className = CoerceSuffix(classify(formName), 'Form');

  return TsMorphAngularProjectTransform(options, (project) => {

    const sourceFile = project.getSourceFileOrThrow('/' + CoerceSuffix(formName, '.form.ts'));
    const classDeclaration = sourceFile.getClassOrThrow(className);

    for (const propertyDeclaration of classDeclaration.getProperties()) {
      const decoratorCount = propertyDeclaration.getDecorators().length;
      if (decoratorCount === 1) {
        continue;
      }
      const useFormControlDecorator = propertyDeclaration.getDecorator('UseFormControl');
      if (useFormControlDecorator) {
        const useFormControlIndex = useFormControlDecorator.getChildIndex();
        if (useFormControlIndex !== decoratorCount - 1) {
          const args = useFormControlDecorator.getArguments().map((a) => a.getText());
          useFormControlDecorator.remove();
          propertyDeclaration.addDecorator({
            name: 'UseFormControl',
            arguments: args,
          });
        }
      }

    }

  });
}
