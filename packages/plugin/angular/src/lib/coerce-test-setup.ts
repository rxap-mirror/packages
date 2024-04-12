import { Tree } from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';

export function coerceTestSetup(tree: Tree, projectName: string) {
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  const testSetupPath = `${projectSourceRoot}/test-setup.ts`;
  if (!tree.exists(testSetupPath)) {
    tree.write(testSetupPath, `// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
`);
  }

  let content = tree.read(testSetupPath, 'utf-8')!;
  if (!content.includes("import { TextDecoder, TextEncoder } from 'util';")) {
    content += `
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder ??= TextEncoder as any;
global.TextDecoder ??= TextDecoder as any;
`;
  }
  if (!content.includes('import \'@angular/localize/init\';')) {
    content += `
import '@angular/localize/init';
jest.spyOn(global as any, '$localize').mockImplementation((...args: any[]) => {
  // This template tag function just returns the first argument with no transformations.
  // Change this to fit your unit test needs.
  return args[0];
});
`;
  }

  tree.write(testSetupPath, content);

}
