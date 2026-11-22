import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Project } from 'ts-morph';
import documentationGenerator from './generator';

const transform = jest.fn();
jest.mock('@rxap/workspace-ts-morph', () => ({ TsMorphTransform: (...args: any[]) => transform(...args) }));

describe('documentation generator', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    transform.mockReset();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should reject unsupported models', async () => {
    await expect(documentationGenerator(tree, { model: 'foo' })).rejects.toThrow('not supported');
  });

  it('should pass the path to the transform', async () => {
    await documentationGenerator(tree, { path: 'sub' });
    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform.mock.calls[0][1]).toMatch(/sub$/);
  });

  it('should walk all declarations and skip spec files', async () => {
    await documentationGenerator(tree, {});
    const operation = transform.mock.calls[0][2];
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile('/a.ts', `
export function f() {}
export interface I { a: string; b(): void; }
export type T = string;
export class C {
  p = 1;
  private q = 2;
  m() {}
  private n() {}
}
`);
    project.createSourceFile('/a.spec.ts', 'export function skipped() {}');
    await operation(project);
    // one PROCESS line for the file plus one per declaration (f, I, I.a, I.b, T, C, C.p, C.m); spec file skipped
    expect((console.log as jest.Mock).mock.calls.filter(call => call[0] === 'undefined undefined'))
      .toHaveLength(9);
  });

});
