import { ExecutorContext } from '@nx/devkit';
import { GetDependentProjectsForProject } from '@rxap/plugin-utilities';

describe('GetDependentProjectsForProject', () => {
  let context: ExecutorContext;

  beforeEach(() => {
    context = {
      projectName: 'my-project',
      projectGraph: {
        nodes: {},
        dependencies: {},
      },
    } as ExecutorContext;
  });

  it('should return dependent projects for a valid project name and project graph', () => {
    context.projectGraph!.dependencies = {
      'my-project': [
        { type: 'static', source: 'my-project', target: 'project-a' },
        { type: 'static', source: 'my-project', target: 'project-b' },
      ],
      'project-a': [],
      'project-b': [],
    };

    const result = GetDependentProjectsForProject(context);

    expect(result).toEqual(['project-a', 'project-b']);
  });

  it('should throw an error when the project graph is undefined', () => {
    context.projectGraph = undefined;

    expect(() => GetDependentProjectsForProject(context)).toThrowError(
      'The projectGraph is undefined. Ensure the projectGraph is passed into the executor context.'
    );
  });

  it('should throw an error when the project name is undefined', () => {
    context.projectName = undefined;

    expect(() => GetDependentProjectsForProject(context)).toThrowError(
      'The projectName is undefined. Ensure the projectName is passed into the executor context.'
    );
  });

  it('should return an empty array when the project has no dependencies', () => {
    context.projectGraph!.dependencies = {
      'my-project': [],
    };

    const result = GetDependentProjectsForProject(context);

    expect(result).toEqual([]);
  });

  it('should exclude dependencies starting with "npm:"', () => {
    context.projectGraph!.dependencies = {
      'my-project': [
        { type: 'static', source: 'my-project', target: 'project-a' },
        { type: 'static', source: 'my-project', target: 'npm:library' },
      ],
      'project-a': [],
      'npm:library': [],
    };

    const result = GetDependentProjectsForProject(context);

    expect(result).toEqual(['project-a']);
  });

  it('should return all dependent projects, including nested dependencies', () => {
    context.projectGraph!.dependencies = {
      'my-project': [
        { type: 'static', source: 'my-project', target: 'project-a' },
        { type: 'static', source: 'my-project', target: 'project-b' },
      ],
      'project-a': [{ type: 'static', source: 'project-a', target: 'project-c' }],
      'project-b': [],
      'project-c': [],
    };

    const result = GetDependentProjectsForProject(context);

    expect(result).toEqual(['project-a', 'project-b', 'project-c']);
  });

  it('should handle circular dependencies gracefully', () => {
    context.projectGraph!.dependencies = {
      'my-project': [{ type: 'static', source: 'my-project', target: 'project-a' }],
      'project-a': [{ type: 'static', source: 'project-a', target: 'my-project' }],
    };

    const result = GetDependentProjectsForProject(context);

    expect(result).toEqual(['project-a']);
  });

  it('should treat an empty project name as an invalid input', () => {
    context.projectName = '';

    expect(() => GetDependentProjectsForProject(context)).toThrowError(
      'The projectName is undefined. Ensure the projectName is passed into the executor context.'
    );
  });
});
