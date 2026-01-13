import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { generateMonolithic } from './generate-monolithic';

describe('generateMonolithic()', () => {

  let tree: Tree;
  const projectName = 'app';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, projectName, {
      root: 'app',
      sourceRoot: 'app/src',
      projectType: 'application',
    });
  });

  it('should generate a monolithic application configuration', async () => {

    await generateMonolithic(tree, projectName, readProjectConfiguration(tree, projectName), {});
    expect(tree.children('app/src/app')).toMatchSnapshot();
    expect(tree.read('app/src/app/app.routes.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('app/src/app/layout.routes.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('app/src/app/app.navigation.ts', 'utf-8')).toMatchSnapshot();

  });

  it('should use MinimalLayoutComponent and no navigation when moduleFederation is host', async () => {

    await generateMonolithic(tree, projectName, readProjectConfiguration(tree, projectName), {
      moduleFederation: 'host'  as any,
    });
    expect(tree.children('app/src/app')).toMatchSnapshot();
    expect(tree.read('app/src/app/app.routes.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.read('app/src/app/layout.routes.ts', 'utf-8')).toMatchSnapshot();
    expect(tree.exists('app/src/app/app.navigation.ts')).toBeFalsy();

  });

});
