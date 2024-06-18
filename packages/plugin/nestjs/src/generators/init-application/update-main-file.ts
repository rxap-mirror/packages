import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { SyntaxKind } from 'ts-morph';
import {
  assertMainStatements,
  MAIN_BOOTSTRAP_STATEMENT,
} from './assert-main-statements';
import { InitApplicationGeneratorSchema } from './schema';

export function updateMainFile(
  tree: Tree,
  projectName: string,
  options: InitApplicationGeneratorSchema,
) {

  TsMorphNestProjectTransform(tree, {
    project: projectName,
    backend: undefined,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile ]) => {

    assertMainStatements(sourceFile);

    const importDeclarations = [];
    const statements: string[] = [];

    if (options.validator) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/nest-server',
        namedImports: [ 'ValidationPipeSetup' ],
      });
      statements.push('server.after(ValidationPipeSetup());');
    }

    if (options.swaggerLive) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/nest-server',
        namedImports: [ 'SetupSwagger' ],
      });
      statements.push('server.after(SetupSwagger());');
    }

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const nestStatement = i < statements.length - 1 ? statements[i + 1] : null;
      const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
      if (!existingStatements.includes(statement)) {
        let index: number;
        if (lastStatement) {
          index = existingStatements.findIndex(s => s.includes(lastStatement)) + 1;
        } else if (nestStatement) {
          index = existingStatements.findIndex(s => s.includes(nestStatement));
        } else {
          index = existingStatements.findIndex(s => s.includes(MAIN_BOOTSTRAP_STATEMENT));
        }
        console.log(`insert statement: ${ statement } at index ${ index }`);
        sourceFile.insertStatements(index, statement);
      }
    }

    if (projectName === 'service-status') {
      const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'bootstrapOptions', { initializer: '{}' });
      const objectLiteralExpression = variableDeclaration.getInitializerIfKindOrThrow(
        SyntaxKind.ObjectLiteralExpression);
      let objectLiteralElementLike = objectLiteralExpression.getProperty('globalPrefixOptions');
      if (!objectLiteralElementLike) {
        objectLiteralElementLike = objectLiteralExpression.addPropertyAssignment({
          name: 'globalPrefixOptions',
          initializer: '{}',
        });
      }
      const gpoPropertyAssigment = objectLiteralElementLike.asKindOrThrow(SyntaxKind.PropertyAssignment);
      const gpoObjectLiteralExpression = gpoPropertyAssigment.getInitializerIfKindOrThrow(
        SyntaxKind.ObjectLiteralExpression);
      let gpoElementLike = gpoObjectLiteralExpression.getProperty('exclude');
      if (!gpoElementLike) {
        gpoElementLike = gpoObjectLiteralExpression.addPropertyAssignment({
          name: 'exclude',
          initializer: `[ '/health(.*)', '/info', '/openapi', '/register' ]`,
        });
      }
    }


  }, [ 'main.ts' ]);

}
