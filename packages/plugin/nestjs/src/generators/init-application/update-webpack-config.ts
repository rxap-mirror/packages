import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { GetProjectRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { isLegacyConfiguration } from './is-legacy-configuration';
import { InitApplicationGeneratorSchema } from './schema';

export function updateWebpackConfig(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (isLegacyConfiguration(project)) {
    return;
  }

  const projectRoot = GetProjectRoot(project);

  // region create initial dev config
  if (!tree.exists(join(projectRoot, 'webpack.config.dev.js'))) {
    tree.write(join(projectRoot, 'webpack.config.dev.js'), tree.read(join(projectRoot, 'webpack.config.js'))!);
  }
  // endregion

  let webpackConfig = tree.read(join(projectRoot, 'webpack.config.js'), 'utf-8')!;
  if (!webpackConfig.includes('fileReplacements')) {
    webpackConfig = webpackConfig.replace(`      target: 'node',`, `      target: 'node',
      fileReplacements: [{
        replace: '${projectRoot}/src/environments/environment.ts',
        with: '${projectRoot}/src/environments/environment.prod.ts',
      }],`);
    tree.write(join(projectRoot, 'webpack.config.js'), webpackConfig);
  }

}
