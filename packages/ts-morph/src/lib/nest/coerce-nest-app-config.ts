import {
  SourceFile,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export interface CoerceNestAppConfigOptionsItem {
  name: string;
  type?: string;
  defaultValue?: string | WriterFunction;
  builder?: (item: Omit<CoerceNestAppConfigOptionsItem, 'builder'>) => string | WriterFunction;
}

export interface CoerceNestAppConfigOptions {
  itemList: Array<CoerceNestAppConfigOptionsItem>;
  overwrite?: boolean;
}

export function CoerceNestAppConfig(sourceFile: SourceFile, options: CoerceNestAppConfigOptions): void {

  const { itemList, overwrite } = options;

  const objVariableDeclaration = CoerceVariableDeclaration(sourceFile, 'validationSchema', {
    type: 'SchemaMap',
    initializer: '{}',
  }, { isExported: false });

  CoerceImports(sourceFile, [
    {
      namedImports: [
        'SchemaMap',
      ],
      moduleSpecifier: 'joi',
    },
    {
      moduleSpecifier: 'joi',
      namespaceImport: 'Joi',
    },
  ]);

  const schemaVariableDeclaration = CoerceVariableDeclaration(sourceFile, 'VALIDATION_SCHEMA', {
    initializer: 'Joi.object(validationSchema)',
  });

  const objIndex = objVariableDeclaration.getVariableStatement()!.getChildIndex();
  const schemaIndex = schemaVariableDeclaration.getVariableStatement()!.getChildIndex();

  const existingNodes = [];

  for (let index = objIndex + 1; index < schemaIndex; index++) {
    existingNodes.push(sourceFile.getStatements()[index]);
  }

  const existingExpressions = existingNodes.filter(node => node.getKind() === SyntaxKind.ExpressionStatement);

  const validationSchemaExpressions = existingExpressions.filter(node => node.getText().startsWith('validationSchema'));

  for (const item of itemList) {
    const existing = validationSchemaExpressions.find(node => node.getText()
                                                                  .startsWith(`validationSchema['${ item.name }']`));
    if (existing) {
      if (overwrite) {
        existing.replaceWithText(writeValidationSchemaExpression(item));
      }
    } else {
      sourceFile.insertStatements(schemaIndex, writeValidationSchemaExpression(item));
    }
  }

}


function writeValidationSchemaExpression(item: CoerceNestAppConfigOptionsItem): WriterFunction {
  return w => {
    w.write(`validationSchema['${ item.name }'] = `);
    const value = item.builder ? item.builder(item) : buildValidationSchemaExpressionValue(item);
    if (typeof value === 'string') {
      w.write(value);
    } else {
      value(w);
    }
  };
}

function buildValidationSchemaExpressionValue(item: Omit<CoerceNestAppConfigOptionsItem, 'builder'>): WriterFunction {
  return w => {
    w.write(`Joi.${ item.type ?? 'string' }()`);
    if (item.defaultValue) {
      if (typeof item.defaultValue === 'string') {
        w.write(`.default(${ item.defaultValue })`);
      } else {
        w.write('.default(');
        item.defaultValue(w);
        w.write(')');
      }
    }
    w.write(';');
  };
}
