import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { AngularInitApplicationGenerator } from '@rxap/plugin-angular';
import {
  DeleteTarget,
  HasProject,
} from '@rxap/workspace-utilities';

export async function coerceCypressApplicationProject(tree: Tree) {

  if (!HasProject(tree, 'cypress')) {
    await AngularInitApplicationGenerator(tree, {
      project: 'cypress',
      coerce: {
        directory: 'angular/cypress',
      },
      skipDocker: true,
      material: true,
    });
    const project = readProjectConfiguration(tree, 'cypress');
    DeleteTarget(project, 'serve');
    DeleteTarget(project, 'extract-i18n');
    DeleteTarget(project, 'lint');
    DeleteTarget(project, 'test');
    project.tags = ['angular', 'ngx'];
    updateProjectConfiguration(tree, 'cypress', project);
  }

}
