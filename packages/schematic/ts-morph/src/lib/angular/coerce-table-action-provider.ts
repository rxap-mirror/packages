import { TsMorphAngularProjectTransform } from '../ts-morph-transform';
import {
  ArrayLiteralExpression,
  PropertyAssignment,
} from 'ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import { AddProviderToArray } from '../add-provider-to-array';

export interface CoerceTableActionProviderOptions {
  project: string;
  feature: string;
  directory?: string;
  actionType: string;
  tableName: string;
}

export function CoerceTableActionProviderRule(options: CoerceTableActionProviderOptions) {
  const {actionType, tableName} = options;

  return TsMorphAngularProjectTransform(options, project => {

    const sourceFile = CoerceSourceFile(project, 'index.ts');

    const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'TABLE_ROW_ACTION_METHODS', {
      initializer: `[]`,
    });

    const formProviderArray = variableDeclaration.getInitializer();

    if (!(formProviderArray instanceof
      ArrayLiteralExpression)) {
      throw new Error('FormProviders initializer is not an array literal expression');
    }

    const className = CoerceSuffix(classify(actionType), 'TableRowActionMethod');

    AddProviderToArray({
      provide: 'RXAP_TABLE_ROW_ACTION_METHOD',
      useClass: className,
      multi: true,
    }, formProviderArray, false, (ole, po) => {
      const provideProperty = ole.getProperty('useClass');

      if (provideProperty instanceof
        PropertyAssignment) {

        return provideProperty.getInitializer()?.getFullText().trim() ===
          po.useClass;

      }
      return false;
    });

    CoerceImports(sourceFile, {
      moduleSpecifier: `./${CoerceSuffix(actionType, '-table-row-action')}.method`,
      namedImports: [className],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/material-table-system',
      namedImports: ['RXAP_TABLE_ROW_ACTION_METHOD'],
    });

  });
}
