import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { GetProjectRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { isLegacyConfiguration } from '../init-application/is-legacy-configuration';

export function updateWebpackConfig(tree: Tree, projectName: string, project: ProjectConfiguration) {

  if (isLegacyConfiguration(project)) {
    return;
  }

  const projectRoot = GetProjectRoot(project);

  // region create initial dev config
  if (!tree.exists(join(projectRoot, 'webpack.config.swagger.js'))) {
    tree.write(join(projectRoot, 'webpack.config.swagger.js'), tree.read(join(projectRoot, 'webpack.config.js'))!);
  }
  // endregion

  let webpackConfig = tree.read(join(projectRoot, 'webpack.config.swagger.js'), 'utf-8')!;
  if (!webpackConfig.includes('fileReplacements')) {
    webpackConfig = webpackConfig.replace(`      target: 'node',`, `      target: 'node',
      fileReplacements: [{
        replace: '${projectRoot}/src/environments/environment.ts',
        with: '${projectRoot}/src/environments/environment.swagger.ts',
      }],`);
  } else if (webpackConfig.includes('src/environments/environment.prod.ts')) {
    webpackConfig = webpackConfig.replace(`src/environments/environment.prod.ts`, 'src/environments/environment.swagger.ts');
  }
  if (!webpackConfig.includes('transformers')) {
    webpackConfig = webpackConfig.replace(`      target: 'node',`, `      target: 'node',
      transformers: [ '@nestjs/swagger/plugin' ],`);
  }
  if (webpackConfig.includes('./src/main.ts')) {
    webpackConfig = webpackConfig.replace('./src/main.ts', './src/swagger.ts');
  }
  if (webpackConfig.includes(`join(__dirname, './dist`)) {
    webpackConfig = webpackConfig.replace(/join\(__dirname, '(.*\.\/)dist/, (_, path) => `join(__dirname, '${path}swagger`);
  }
  tree.write(join(projectRoot, 'webpack.config.swagger.js'), webpackConfig);

}
