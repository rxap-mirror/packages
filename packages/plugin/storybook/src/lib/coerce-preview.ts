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

export function coercePreview(tree: Tree, projectName: string, options: InitLibraryGeneratorSchema) {

  return TsMorphProjectTransform(tree, {
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
        defaultTheme: w => w.quote('light'),
        parentSelector: w => w.quote('body'),
      })(w);
      w.write(')');
    }, e => e.getText().startsWith('withThemeByClassName'));
    CoerceArrayElement(arrayLiteralExpression, w => {
      w.write('applicationConfig(');
      Writers.object({
        providers: w => {
          w.writeLine('[');
          w.writeLine('provideHttpClient(),');
          w.writeLine('ProvideIconAssetPath([');
          w.quote('mdi.svg');
          w.write(',');
          w.quote('custom.svg');
          w.writeLine(']),');
          w.writeLine('provideNoopAnimations(),');
          w.writeLine('ProvideConfig(),');
          w.writeLine(`ProvideEnvironment({app: '${projectName}-storybook', production: false}),`);
          w.writeLine('],');
        }
      })(w);
      w.write(')');
    }, e => e.getText().startsWith('applicationConfig'));
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'provideHttpClient' ],
        moduleSpecifier: '@angular/common/http',
      },
      {
        namedImports: [ 'provideNoopAnimations' ],
        moduleSpecifier: '@angular/platform-browser/animations',
      },
      {
        namedImports: [ 'ProvideIconAssetPath' ],
        moduleSpecifier: '@rxap/icon',
      },
      {
        namedImports: [ 'ProvideConfig' ],
        moduleSpecifier: '@rxap/config',
      },
      {
        namedImports: [ 'ProvideEnvironment' ],
        moduleSpecifier: '@rxap/environment',
      },
      {
        namedImports: [ 'withThemeByClassName' ],
        moduleSpecifier: '@storybook/addon-themes',
      },
      {
        namedImports: [ 'applicationConfig' ],
        moduleSpecifier: '@storybook/angular',
      },
      {
        moduleSpecifier: '@angular/localize/init',
      }
    ]);
  }, '.storybook/preview.ts');



}
