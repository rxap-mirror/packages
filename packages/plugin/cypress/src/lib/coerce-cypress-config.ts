import { Tree } from '@nx/devkit';
import {
  CoerceFile,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function coerceCypressConfig(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  const cypressConfigPath = join(projectRoot, 'cypress.config.ts');

  let replace = false;
  if (!tree.exists(cypressConfigPath)) {
    replace = true;
  } else if (tree.read(cypressConfigPath, 'utf-8').includes('nxComponentTestingPreset')) {
    replace = true;
  }

  if (replace) {
    CoerceFile(tree, cypressConfigPath, `import { defineConfig } from 'cypress';
import { componentTestingPreset } from 'workspace/cypress/config';

export default defineConfig({
  component: componentTestingPreset(__filename),
});
`, true);
  }

}
