import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFilesStructure,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function initE2eProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  const e2eTestFolder = join(projectSourceRoot, 'server');
  const defaultE2eTestFilePath = join(e2eTestFolder, 'server.spec.ts');

  if (tree.exists(defaultE2eTestFilePath)) {
    const content = tree.read(defaultE2eTestFilePath, 'utf-8')!;
    if (content.includes('GET /api') && content.includes('should return a message') && content.includes('Hello API')) {
      console.log('The default e2e test file is used. Replace with the custom e2e test file.');
      tree.delete(defaultE2eTestFilePath);
      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files', 'e2e'),
        target: e2eTestFolder,
        overwrite: options.overwrite,
      });
    }
  }

  const testSetupFilePath = join(projectSourceRoot, 'support', 'test-setup.ts');
  if (tree.exists(testSetupFilePath)) {
    let testSetupContent = tree.read(testSetupFilePath, 'utf-8')!;
    testSetupContent = testSetupContent.replace(/process.env.PORT \?\? '\d+';/, `process.env.PORT ?? '${options.port}';`);
    tree.write(testSetupFilePath, testSetupContent);
  }

}
