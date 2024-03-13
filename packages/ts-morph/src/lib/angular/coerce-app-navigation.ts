import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { IconConfig } from '@rxap/utilities';
import {
  SourceFile,
  SyntaxKind,
  Writers,
} from 'ts-morph';

export interface AppNavigationItem {
  routerLink: string[],
  label: string,
  children?: AppNavigationItem[],
  icon?: IconConfig,
}

export interface CoerceAppNavigationOptions {
  itemList?: AppNavigationItem[];
}

export function CoerceAppNavigation(sourceFile: SourceFile, options: CoerceAppNavigationOptions = {}) {

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'APP_NAVIGATION', {
    type: '() => NavigationWithInserts',
    initializer: '() => []',
  });

  CoerceVariableDeclaration(sourceFile, 'APP_NAVIGATION_PROVIDER', {
    initializer: Writers.object({
      provide: 'RXAP_NAVIGATION_CONFIG',
      useValue: 'APP_NAVIGATION',
    }),
  });

  CoerceImports(sourceFile, [
    {
      namedImports: [ 'NavigationWithInserts', 'RXAP_NAVIGATION_CONFIG' ],
      moduleSpecifier: '@rxap/layout',
    },
  ]);

  const arrowFunction = variableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ArrowFunction);
  const array = arrowFunction.getBody().asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  const arrayLiteralExpression = array.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  const existingItems = arrayLiteralExpression.getElements()
    .filter(e => e.isKind(SyntaxKind.ObjectLiteralExpression))
    .map(e => e.asKindOrThrow(SyntaxKind.ObjectLiteralExpression));
  const existingItemLabels = existingItems.map(
    e => e.getProperty('label')?.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializerIfKindOrThrow(
      SyntaxKind.StringLiteral).getText().trim().replace(/['"]/g, ''));
  for (const item of options.itemList ?? []) {
    if (!existingItemLabels.some(e => e === item.label)) {
      arrayLiteralExpression.addElement(Writers.object({
        routerLink: w => {
          w.write('[');
          for (let i = 0; i < item.routerLink.length; i++) {
            const link = item.routerLink[i];
            w.quote(link);
            if (i < item.routerLink.length - 1) {
              w.write(',');
            }
          }
          w.write(']');
        },
        label: w => w.quote(item.label),
      }));
    }

  }

}
