import { Project } from 'ts-morph';
import { CreateProject } from '../create-project';
import { AddRoute } from './add-route';

describe('AddRoute', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should add route to empty routes array', () => {

    const sourceCode = `const ROUTES: Route[] = [];`;

    const sourceFile = project.createSourceFile('routes.ts', sourceCode);

    AddRoute(sourceFile, { path: 'path' });

    expect(sourceFile.getText()).toEqual(`const ROUTES: Route[] = [{
    path: 'path'
  }];`);

  });

  it('should add new route to the route array at the start', () => {
    const sourceCode = `const ROUTES: Route[] = [{path:'path'}];`;

    const sourceFile = project.createSourceFile('routes.ts', sourceCode);

    AddRoute(sourceFile, { path: 'newPath' });

    expect(sourceFile.getText()).toEqual(`const ROUTES: Route[] = [{
    path: 'newPath'
  }, {path:'path'}];`);
  });

});
