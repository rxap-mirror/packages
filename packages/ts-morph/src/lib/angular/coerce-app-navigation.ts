import {
  IconConfig,
  IsMaterialIcon,
  IsSvgIcon,
  NormalizeIconConfig,
} from '@rxap/utilities';
import {
  SourceFile,
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export interface AppNavigationItem {
  routerLink: string[],
  label: string,
  children?: AppNavigationItem[],
  icon?: IconConfig,
}

export interface CoerceAppNavigationOptions {
  itemList?: AppNavigationItem[];
  overwrite?: boolean;
}

export function CoerceAppNavigation(sourceFile: SourceFile, options: CoerceAppNavigationOptions = {}) {

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'APP_NAVIGATION', {
    type: '() => NavigationWithInserts',
    initializer: '() => []',
  });

  CoerceImports(sourceFile, [
    {
      namedImports: [ 'NavigationWithInserts', 'RXAP_NAVIGATION_CONFIG' ],
      moduleSpecifier: '@rxap/layout',
    },
  ]);

  if (!options.itemList?.length) {
    return;
  }

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
    const existingItemIndex = existingItemLabels.findIndex(e => e === item.label);
    const routerLink: WriterFunction = w => {
      w.write('[');
      for (let i = 0; i < item.routerLink.length; i++) {
        const link = item.routerLink[i];
        w.quote(link);
        if (i < item.routerLink.length - 1) {
          w.write(',');
        }
      }
      w.write(']');
    };
    let icon: WriterFunction | null = null;
    if (item.icon) {
      const normalizedIcon = NormalizeIconConfig(item.icon);
      const iconObj: Record<string, string | WriterFunction> = {};
      if (normalizedIcon.color) {
        iconObj['color'] = w => w.quote(normalizedIcon.color!);
      }
      if (IsSvgIcon(normalizedIcon)) {
        const name = normalizedIcon.svgIcon;
        iconObj['svgIcon'] = w => w.quote(name);
      }
      if (IsMaterialIcon(normalizedIcon)) {
        const name = normalizedIcon.icon;
        iconObj['icon'] = w => w.quote(name);
      }
      icon = Writers.object(iconObj);
    }
    if (existingItemIndex === -1) {
      const obj: Record<string, string | WriterFunction> = {
        routerLink,
        label: w => w.quote(item.label),
      };
      if (icon) {
        obj['icon'] = icon;
      }
      arrayLiteralExpression.addElement(Writers.object(obj));
    } else {
      const existingItem = existingItems[existingItemIndex];
      existingItem.getProperty('routerLink')?.asKindOrThrow(SyntaxKind.PropertyAssignment).setInitializer(routerLink);
      if (icon) {
        if (!existingItem.getProperty('icon')) {
          existingItem.addPropertyAssignment({
            name: 'icon',
            initializer: icon,
          });
        } else if (options.overwrite) {
          existingItem.getProperty('icon')?.asKindOrThrow(SyntaxKind.PropertyAssignment).setInitializer(icon);
        }
      } else if (options.overwrite) {
        existingItem.getProperty('icon')?.remove();
      }
    }

  }

}
