import { Project } from 'ts-morph';
import { CreateProject } from '../create-project';
import { RemoveRoute } from './remove-route';

describe('RemoveRoute', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should add route to empty routes array', () => {

    const sourceCode = `export const ROUTES: Route[] = [
  {
    path: '',
    component: NxWelcomeComponent,
  },
];`;

    const sourceFile = project.createSourceFile('routes.ts', sourceCode);

    RemoveRoute(sourceFile, { component: 'NxWelcomeComponent' });

    expect(sourceFile.getText()).toEqual(`export const ROUTES: Route[] = [
];`);

  });
});
