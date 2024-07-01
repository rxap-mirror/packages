import { Project } from 'ts-morph';
import { CreateProject } from '../create-project';
import { CoerceLayoutRoutes } from './coerce-layout-routes';

describe('CoerceLayoutRouters', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should coerce layout routers', () => {
    const sourceFile = project.createSourceFile('layout.routes.ts');
    CoerceLayoutRoutes(sourceFile, { withNavigation: true, withStatusCheckGuard: true, withDefaultHeader: true });
    expect(sourceFile.getFullText()).toMatchSnapshot();
  });

});
