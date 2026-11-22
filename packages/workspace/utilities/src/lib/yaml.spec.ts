import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { GetYamlFile, HasYamlFile, UpdateYamlFile } from './yaml-file';
import { GetYamlDocument, HasYamlDocument, UpdateYamlDocument } from './yaml-document';

describe('yaml file', () => {
  it('detects, reads and updates yaml', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('ok.yaml', 'a: 1\n');
    tree.write('bad.yaml', 'a: [1\n');
    expect(HasYamlFile(tree, 'missing.yaml')).toBe(false);
    expect(HasYamlFile(tree, 'bad.yaml')).toBe(false);
    expect(HasYamlFile(tree, 'ok.yaml')).toBe(true);
    expect(() => GetYamlFile(tree, 'missing.yaml')).toThrow('does not exists');
    expect(() => GetYamlFile(tree, 'bad.yaml')).toThrow('Could not parse');
    expect(GetYamlFile(tree, 'created.yaml', true)).toEqual({});

    UpdateYamlFile(tree, (y: any) => { y.b = 2; }, 'ok.yaml');
    expect(GetYamlFile(tree, 'ok.yaml')).toEqual({ a: 1, b: 2 });
    await UpdateYamlFile(tree, async (y: any) => { y.c = 3; }, 'ok.yaml', { space: 4 });
    expect(GetYamlFile(tree, 'ok.yaml')).toEqual({ a: 1, b: 2, c: 3 });
    UpdateYamlFile(tree, { z: 1 }, 'ok.yaml');
    expect(GetYamlFile(tree, 'ok.yaml')).toEqual({ z: 1 });
    UpdateYamlFile(tree, () => undefined, 'new.yaml', { coerce: true });
    expect(tree.exists('new.yaml')).toBe(true);
  });
});

describe('yaml document', () => {
  it('detects, reads and updates yaml documents', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('ok.yaml', '# comment\na: 1\n');
    tree.write('bad.yaml', 'a: [1\n');
    expect(HasYamlDocument(tree, 'missing.yaml')).toBe(false);
    expect(HasYamlDocument(tree, 'bad.yaml')).toBe(true);
    expect(HasYamlDocument(tree, 'ok.yaml')).toBe(true);
    expect(() => GetYamlDocument(tree, 'missing.yaml')).toThrow('does not exists');
    expect(GetYamlDocument(tree, 'created.yaml', true).toJSON()).toEqual({});

    UpdateYamlDocument(tree, (doc) => { doc.set('b', 2); }, 'ok.yaml');
    const content = tree.read('ok.yaml', 'utf-8')!;
    expect(content).toContain('# comment');
    expect(content).toContain('b: 2');
    await UpdateYamlDocument(tree, async (doc) => { doc.set('c', 3); }, 'ok.yaml');
    expect(tree.read('ok.yaml', 'utf-8')).toContain('c: 3');
    const before = tree.read('ok.yaml', 'utf-8');
    UpdateYamlDocument(tree, () => undefined, 'ok.yaml');
    expect(tree.read('ok.yaml', 'utf-8')).toBe(before);
  });
});
