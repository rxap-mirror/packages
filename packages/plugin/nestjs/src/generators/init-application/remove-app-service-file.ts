import { Tree } from '@nx/devkit';
import { join } from 'path';

export function removeAppServiceFile(tree: Tree, projectSourceRoot: string) {

  const appServiceFilePath = join(projectSourceRoot, 'app', 'app.service.ts');
  if (tree.exists(appServiceFilePath)) {
    const content = tree.read(appServiceFilePath)?.toString('utf-8');
    if (content) {
      if (content.includes('{ message: \'Hello API\' }')) {
        console.warn('Remove the app service file');
        tree.delete(appServiceFilePath);
        if (tree.exists(join(projectSourceRoot, 'app', 'app.service.spec.ts'))) {
          console.warn('Remove the app service spec file');
          tree.delete(join(projectSourceRoot, 'app', 'app.service.spec.ts'));
        } else {
          console.warn('The app service spec file does not exists');
        }
      } else {
        console.warn('The app service file does not contains the default method', content);
      }
    } else {
      console.warn('The app service file does not exists:', appServiceFilePath);
    }
  } else {
    console.warn('The app service file does not exists');
  }

}
