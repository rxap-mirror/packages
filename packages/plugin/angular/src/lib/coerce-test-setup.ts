import { Tree } from '@nx/devkit';
import { CoerceImports } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  CoerceFile,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';

export function coerceTestSetup(tree: Tree, projectName: string) {
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  const testSetupPath = `${projectSourceRoot}/test-setup.ts`;
  CoerceFile(tree, testSetupPath, `// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
`);

  TsMorphAngularProjectTransform(tree, { project: projectName, basePath: projectSourceRoot }, (_, [ sourceFile ]) => {

    CoerceImports(sourceFile, [
      {
        moduleSpecifier: 'util',
        namedImports: [ 'TextDecoder', 'TextEncoder' ],
      },
      {
        moduleSpecifier: '@angular/localize/init',
      },
    ]);

    const hasTextEncoderStatement = !!sourceFile.getStatement(
      statement => statement.getText().includes('global.TextEncoder ??= TextEncoder as any;'));
    const hasTextDecoderStatement = !!sourceFile.getStatement(
      statement => statement.getText().includes('global.TextDecoder ??= TextDecoder as any;'));
    const hasLocalizeInitStatement = !!sourceFile.getStatement(
      statement => statement.getText().includes('jest.spyOn(global as any, \'$localize\')'));

    if (!hasTextEncoderStatement) {
      sourceFile.addStatements(`global.TextEncoder ??= TextEncoder as any;`);
    }

    if (!hasTextDecoderStatement) {
      sourceFile.addStatements(`global.TextDecoder ??= TextDecoder as any;`);
    }

    if (!hasLocalizeInitStatement) {
      sourceFile.addStatements(`jest.spyOn(global as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});`);
    }

  }, [ 'test-setup.ts' ]);

}
