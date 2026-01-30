import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  CallExpression,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { CoercePropertyAssignment } from '../coerce-property-assignment';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export interface CoerceStoriesOptions {
  /**
   * The name of the component the stories are for.
   */
  componentName: string;
  /**
   * The feature name (used in story title).
   */
  feature?: string | null;
  /**
   * Function to configure module metadata (imports, providers).
   */
  moduleMetadata?: (moduleDecoratorObject: ObjectLiteralExpression) => void;
  /**
   * Parent title for the story hierarchy.
   */
  parentTitle?: string;
}

/**
 * Coerces a Storybook stories file for an Angular component.
 * Creates the default export (Meta) and a Primary story.
 *
 * @param sourceFile - The source file to create the stories in.
 * @param options - Options for the stories (component name, feature, metadata).
 */
export function CoerceStories(sourceFile: SourceFile, options: CoerceStoriesOptions) {

  const { feature, componentName, moduleMetadata, parentTitle } = options;

  CoerceImports(sourceFile, [
    {
      moduleSpecifier: '@storybook/angular',
      namedImports: [ 'Meta', 'StoryObj' ]
    },
    {
      moduleSpecifier: `./${dasherize(componentName)}.component`,
      namedImports: [ `${classify(componentName)}Component` ]
    }
  ]);

  let title = classify(componentName);

  if (parentTitle) {
    title = `${parentTitle} / ${title}`;
  } else if (feature) {
    title = `${classify(feature)} / ${title}`;
  }

  const meta: Record<string, string | WriterFunction> = {
    component: `${classify(componentName)}Component`,
    title: w => w.quote(title),
  };

  if (moduleMetadata) {
    meta['decorators'] = w => {
      w.writeLine('[');
      w.writeLine('  moduleMetadata({})');
      w.newLine();
      w.write(']');
    };
    CoerceImports(sourceFile, {
      moduleSpecifier: '@storybook/angular',
      namedImports: [ 'moduleMetadata' ]
    });
  }

  const metaDeclaration = CoerceVariableDeclaration(sourceFile, 'meta', {
    type: `Meta<${classify(componentName)}Component>`,
    initializer: Writers.object(meta)
  }, { isExported: false });

  if (!sourceFile.getStatement(s => s.getText().includes('export default meta;'))) {
    sourceFile.addStatements(`export default meta;`);
  }

  if (!sourceFile.getStatement(s => s.getText().includes('type Story = StoryObj<'))) {
    sourceFile.addStatements(`type Story = StoryObj<${classify(componentName)}Component>;`);
  }

  CoerceVariableDeclaration(sourceFile, 'Primary', {
    type: `Story`,
    initializer: Writers.object({ args: '{}' })
  });

  if (moduleMetadata) {
    const initializer = metaDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    const decoratorsProperty = CoercePropertyAssignment(initializer, 'decorators', '[ moduleMetadata({}) ]');
    const decoratorsInitializer = decoratorsProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    const moduleMetadataFunction = decoratorsInitializer.getElements().find(e => e.isKind(SyntaxKind.CallExpression)) as CallExpression;
    const firstArgument = moduleMetadataFunction.getArguments()[0].asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    moduleMetadata(firstArgument);
  }


}
