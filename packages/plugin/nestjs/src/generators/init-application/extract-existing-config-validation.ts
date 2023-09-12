import {
  CoerceNestAppConfigOptionsItem,
  GetNestModuleMetadata,
} from '@rxap/ts-morph';
import {
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

export function ExtractExistingConfigValidation(sourceFile: SourceFile): CoerceNestAppConfigOptionsItem[] {

  const metadata = GetNestModuleMetadata(sourceFile);
  const imports = metadata.getProperty('imports');
  if (!imports) {
    return [];
  }
  const arrayLiteralExpressionProperty = imports.asKindOrThrow(SyntaxKind.PropertyAssignment);
  const arrayLiteralExpression = arrayLiteralExpressionProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  for (const item of arrayLiteralExpression.getElements()) {
    if (item.getText().trim().startsWith('ConfigModule')) {
      const configModule = item.asKindOrThrow(SyntaxKind.CallExpression);
      const configModuleArguments = configModule.getArguments();
      if (configModuleArguments.length === 1) {
        const configModuleArgument = configModuleArguments[0];
        const objectLiteralExpression = configModuleArgument.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const validateLiteralElement = objectLiteralExpression.getProperty('validationSchema')
                                                              .asKindOrThrow(SyntaxKind.PropertyAssignment);
        const joiObject = validateLiteralElement?.getInitializerIfKind(SyntaxKind.CallExpression);
        const joiObjectArgument = joiObject?.getArguments()[0];
        const objectLiteralExpression2 = joiObjectArgument?.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const items: CoerceNestAppConfigOptionsItem[] = [];
        for (const property of objectLiteralExpression2.getProperties()) {
          const propertyAssignment = property.asKindOrThrow(SyntaxKind.PropertyAssignment);
          const initializer = propertyAssignment.getInitializer();
          const text = initializer.getText();
          const item: CoerceNestAppConfigOptionsItem = {
            name: propertyAssignment.getName(),
            builder: () => text,
            text,
          } as any;
          items.push(item);
        }
        return items;
      }
    }
  }

  return [];
}
