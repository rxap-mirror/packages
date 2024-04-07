import { Tree } from '@nx/devkit';
import {
  CoerceArrayElement,
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphProjectTransform } from '@rxap/workspace-ts-morph';
import {
  SyntaxKind,
  Writers,
} from 'ts-morph';
import { InitLibraryGeneratorSchema } from '../generators/init-library/schema';

export async function coercePreview(tree: Tree, projectName: string, options: InitLibraryGeneratorSchema) {

  TsMorphProjectTransform(tree, {
    project: projectName,
  }, (project, sourceFile) => {

    if (options.compodoc) {
      CoerceImports(sourceFile, [
        {
          defaultImport: 'docJson',
          moduleSpecifier: '../documentation.json',
        },
        {
          namedImports: [ 'setCompodocJson' ],
          moduleSpecifier: '@storybook/addon-docs/angular',
        }
      ]);
      // add the setCompodocJson call to the preview.ts file if not already exists
      if (!sourceFile.getStatements().find(statement => statement.getText().includes('setCompodocJson(docJson)'))) {
        sourceFile.addStatements([ 'setCompodocJson(docJson);' ]);
      }
    }

    const decoratorsDeclaration = CoerceVariableDeclaration(sourceFile, 'decorators', { initializer: '[]' });
    const arrayLiteralExpression = decoratorsDeclaration.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    CoerceArrayElement(arrayLiteralExpression, w => {
      w.write('withThemeByClassName(');
      Writers.object({
        themes: Writers.object({
          // nameOfTheme: 'classNameForTheme',
          light: w => w.quote(''),
          dark: w => w.quote('dark'),
        }),
        defaultTheme: w => w.quote('dark'),
      })(w);
      w.write(')');
    }, e => e.getText().startsWith('withThemeByClassName'));
    CoerceArrayElement(arrayLiteralExpression, w => {
      w.write('applicationConfig(');
      Writers.object({
        providers: w => {
          w.writeLine('[');
          w.writeLine('importProvidersFrom(HttpClientModule),');
          w.writeLine('ProvideIconAssetPath([');
          w.quote('mdi.svg');
          w.write(',');
          w.quote('custom.svg');
          w.writeLine(']),');
          w.writeLine('],');
        }
      })(w);
      w.write(')');
    }, e => e.getText().startsWith('applicationConfig'));
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'HttpClientModule' ],
        moduleSpecifier: '@angular/common/http',
      },
      {
        namedImports: [ 'importProvidersFrom' ],
        moduleSpecifier: '@angular/core',
      },
      {
        namedImports: [ 'ProvideIconAssetPath' ],
        moduleSpecifier: '@rxap/icon',
      },
      {
        namedImports: [ 'withThemeByClassName' ],
        moduleSpecifier: '@storybook/addon-themes',
      },
      {
        namedImports: [ 'applicationConfig' ],
        moduleSpecifier: '@storybook/angular',
      },
    ]);
  }, '.storybook/preview.ts');



}
