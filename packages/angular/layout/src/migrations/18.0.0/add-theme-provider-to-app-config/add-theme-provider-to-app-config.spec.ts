import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  addProjectConfiguration,
  Tree,
} from '@nx/devkit';

import update from './add-theme-provider-to-app-config';

describe('add-theme-provider-to-app-config migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(tree, 'service', {
      root: 'apps/service',
      projectType: 'application',
      sourceRoot: 'apps/service/src',
      tags: [ 'service' ],
      targets: {},
    });
    addProjectConfiguration(tree, 'angularA', {
      root: 'apps/angularA',
      projectType: 'application',
      sourceRoot: 'apps/angularA/src',
      tags: [ 'angular' ],
      targets: {},
    });
    addProjectConfiguration(tree, 'angularB', {
      root: 'apps/angularB',
      projectType: 'application',
      sourceRoot: 'apps/angularB/src',
      tags: [ 'angular' ],
      targets: {},
    });
    tree.write('apps/angularB/src/app/layout.routes.ts', '');
    addProjectConfiguration(tree, 'angularC', {
      root: 'apps/angularC',
      projectType: 'application',
      sourceRoot: 'apps/angularC/src',
      tags: [ 'angular' ],
      targets: {},
    });
    tree.write('apps/angularC/src/app/layout.routes.ts', '');
    tree.write('apps/angularC/src/app/app.config.ts', '');
    addProjectConfiguration(tree, 'angularD', {
      root: 'apps/angularD',
      projectType: 'application',
      sourceRoot: 'apps/angularD/src',
      tags: [ 'angular' ],
      targets: {},
    });
    tree.write('apps/angularD/src/app/layout.routes.ts', '');
    tree.write('apps/angularD/src/app/app.config.ts', 'export const appConfig = { providers: [] };');
  });

  it('should run successfully', async () => {
    await update(tree);
    expect(tree.read('apps/angularC/src/app/app.config.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('apps/angularD/src/app/app.config.ts', 'utf-8')).toMatchSnapshot();
  });
});
