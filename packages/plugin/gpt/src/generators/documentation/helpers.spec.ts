import { CreateProject } from '@rxap/ts-morph';
import { addJsDoc } from './add-js-doc';
import { cleanupJsDoc } from './cleanup-js-doc';
import { composeContext } from './compose-context';
import { hasJsDoc } from './has-js-doc';
import { loadSystemPrompt } from './load-system-prompt';
import { skipSourceFile } from './skip-source-file';

describe('gpt documentation helpers', () => {

  describe('cleanupJsDoc', () => {
    it('should strip comment markers and the closing line', () => {
      const jsDoc = [ '/**', ' * Adds numbers.', ' * @param a first', ' */' ].join('\n');
      expect(cleanupJsDoc(jsDoc)).toBe([ '', 'Adds numbers.', '@param a first' ].join('\n'));
    });
  });

  describe('addJsDoc / hasJsDoc', () => {
    it('should add a cleaned js doc', () => {
      const project = CreateProject();
      const sf = project.createSourceFile('a.ts', 'export function a() {}');
      const fn = sf.getFunctions()[0];
      expect(hasJsDoc(fn)).toBe(false);
      addJsDoc({}, fn, '/**\n * Hello\n */');
      expect(hasJsDoc(fn)).toBe(true);
      expect(fn.getJsDocs()[0].getDescription()).toContain('Hello');
    });

    it('should not modify the node in offline mode', () => {
      const project = CreateProject();
      const fn = project.createSourceFile('a.ts', 'export function a() {}').getFunctions()[0];
      addJsDoc({ offline: true }, fn, '/**\n * Hello\n */');
      expect(hasJsDoc(fn)).toBe(false);
    });
  });

  describe('skipSourceFile', () => {
    const project = CreateProject();
    const create = (name: string) => project.createSourceFile(name, '', { overwrite: true });

    it.each([ 'index.ts', 'a.spec.ts', 'a.stories.ts', 'a.cy.ts' ])('should skip %s', (name) => {
      expect(skipSourceFile(create(name))).toBe(true);
    });

    it('should not skip regular files', () => {
      expect(skipSourceFile(create('a.ts'))).toBe(false);
    });

    it('should respect the filter', () => {
      expect(skipSourceFile(create('/src/foo/a.ts'), 'foo')).toBe(false);
      expect(skipSourceFile(create('/src/foo/a.ts'), 'bar')).toBe(true);
    });
  });

  describe('loadSystemPrompt', () => {
    it('should load an existing prompt', () => {
      expect(loadSystemPrompt('function').length).toBeGreaterThan(0);
    });

    it('should throw for an unknown prompt', () => {
      expect(() => loadSystemPrompt('does-not-exist')).toThrow('Can not find system prompt file');
    });
  });

  describe('composeContext', () => {
    it('should list referenced and referencing source files', () => {
      const project = CreateProject();
      project.createSourceFile('/dep.ts', 'export const dep = 1;');
      const main = project.createSourceFile('/main.ts', `import { dep } from './dep';\nexport const x = dep;`);
      project.createSourceFile('/user.ts', `import { x } from './main';\nexport const y = x;`);
      const xml = composeContext(main);
      expect(xml).toContain('<context>');
      expect(xml).toContain('path="/dep.ts"');
      expect(xml).toContain('path="/user.ts"');
      expect(xml).toContain('</context>');
    });
  });

});
