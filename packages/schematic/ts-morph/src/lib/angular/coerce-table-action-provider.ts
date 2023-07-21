import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  ArrayLiteralExpression,
  PropertyAssignment,
} from 'ts-morph';
import { AddProviderToArray } from '../add-provider-to-array';
import { CoerceSourceFile } from '../coerce-source-file';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import { TsMorphAngularProjectTransformRule } from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';

export interface CoerceTableActionProviderOptions {
  project: string;
  feature?: string | null;
  directory?: string | null;
  type: string;
  tableName: string;
}

export function CoerceTableActionProviderRule(options: CoerceTableActionProviderOptions) {
  const {
    type,
    tableName,
  } = options;

  return TsMorphAngularProjectTransformRule(options, project => {

    const sourceFile = CoerceSourceFile(project, 'index.ts');

    const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'TABLE_ROW_ACTION_METHODS', {
      initializer: `[]`,
    });

    const formProviderArray = variableDeclaration.getInitializer();

    if (!(formProviderArray instanceof
      ArrayLiteralExpression)) {
      throw new Error('FormProviders initializer is not an array literal expression');
    }

    const className = CoerceSuffix(classify(type), 'TableRowActionMethod');

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
      moduleSpecifier: `./${ CoerceSuffix(type, '-table-row-action') }.method`,
      namedImports: [ className ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@rxap/material-table-system',
      namedImports: [ 'RXAP_TABLE_ROW_ACTION_METHOD' ],
    });

  });
}
