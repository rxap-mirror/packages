import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  AddProviderToArray,
  CoerceArrayElement,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphProjectTransform } from '@rxap/workspace-ts-morph';
import {
  GetProjectRoot,
  IsApplicationProject,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import {
  ObjectLiteralExpression,
  OptionalKind,
  PropertyAssignment,
  PropertyAssignmentStructure,
  SyntaxKind,
  Writers,
} from 'ts-morph';
import { InitLibraryGeneratorSchema } from '../generators/init-library/schema';

function CoerceObjectLiteralExpressionPropertyAssignment(
  objectLiteralExpression: ObjectLiteralExpression,
  propertyName: string,
  structure: OptionalKind<Omit<PropertyAssignmentStructure, 'name'>>,
): PropertyAssignment {

  const property = objectLiteralExpression.getProperty(propertyName);
  if (property) {
    return property.asKindOrThrow(SyntaxKind.PropertyAssignment);
  } else {
    return objectLiteralExpression.addPropertyAssignment({
      name: propertyName,
      initializer: structure.initializer,
    });
  }

}

export async function coerceMain(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  TsMorphProjectTransform(tree, {
    project: projectName,
  }, (_, sourceFile) => {

    const config = CoerceVariableDeclaration(sourceFile, 'config', { initializer: '{}' });
    const objectLiteralExpression = config.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    // region staticDirs
    const projectRoot = GetProjectRoot(tree, projectName);
    if (IsApplicationProject(project)) {
      const storiesPA = CoerceObjectLiteralExpressionPropertyAssignment(objectLiteralExpression, 'stories', { initializer: '[]' });
      const storiesArrayLiteralExpression = storiesPA.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
      CoerceArrayElement(
        storiesArrayLiteralExpression, `'../src/feature/**/*.stories.@(js|jsx|ts|tsx|mdx)'`);
    }
    CoerceObjectLiteralExpressionPropertyAssignment(objectLiteralExpression, 'staticDirs', {
      initializer: w => {
        w.writeLine('[');
        Writers.object({
          from: w => w.quote(join(relative(join(projectRoot, '.storybook'), tree.root), 'shared/angular/assets')),
          to: w => w.quote('/'),
        })(w);
        w.writeLine(']');
      },
    });
    // endregion
    // region docs
    const docs = CoerceObjectLiteralExpressionPropertyAssignment(objectLiteralExpression, 'docs', {
      initializer: '{}',
    });
    const docsObjectLiteralExpression = docs.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    CoerceObjectLiteralExpressionPropertyAssignment(docsObjectLiteralExpression, 'autodocs', { initializer: 'true' });
    // endregion
    // region addons
    const addons = CoerceObjectLiteralExpressionPropertyAssignment(objectLiteralExpression, 'addons', { initializer: '[]' });
    const addonsArrayLiteralExpression = addons.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    CoerceArrayElement(addonsArrayLiteralExpression, `'@storybook/addon-interactions'`);
    CoerceArrayElement(addonsArrayLiteralExpression, `'@storybook/addon-themes'`);
    // endregion

  }, '.storybook/main.ts');


}
