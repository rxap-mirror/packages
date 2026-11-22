import {
  Project,
  SyntaxKind,
} from 'ts-morph';
import { addJsDoc } from './add-js-doc';
import { assertTokenLimit } from './assert-token-limit';
import { clearAllJsDocs } from './clear-all-js-docs';
import { clearJsDoc } from './clear-js-doc';
import {
  composeContext,
  sourceFileToContextSourceFile,
} from './compose-context';
import { countTokens } from './count-tokens';
import { hasJsDoc } from './has-js-doc';

jest.mock('tiktoken', () => ({
  encoding_for_model: jest.fn((model: string) => ({
    encode: (text: string) => ({ length: text.length }),
    free: jest.fn(),
    model,
  })),
}));

function create(text: string, name = 'a.ts') {
  return new Project({ useInMemoryFileSystem: true }).createSourceFile(name, text);
}

describe('js doc helpers', () => {

  it('should add, detect and clear js docs', () => {
    const fn = create('export function a() {}').getFunctions()[0];
    expect(hasJsDoc(fn)).toBe(false);
    addJsDoc(fn, 'Hello');
    expect(hasJsDoc(fn)).toBe(true);
    clearJsDoc(fn);
    expect(hasJsDoc(fn)).toBe(false);
  });

});

describe('token helpers', () => {

  it('should count tokens for openai models', () => {
    expect(countTokens('openai/gpt-4o', 'abc')).toBe(3);
    expect(require('tiktoken').encoding_for_model).toHaveBeenLastCalledWith('gpt-4o');
  });

  it('should fall back to gpt-4o for other providers', () => {
    expect(countTokens('anthropic/claude-3-5-sonnet', 'abcd')).toBe(4);
    expect(require('tiktoken').encoding_for_model).toHaveBeenLastCalledWith('gpt-4o');
  });

  it('should sum the tokens and enforce the limit', () => {
    expect(assertTokenLimit('openai/gpt-4o', 'ab', 'cde')).toBe(5);
    expect(() => assertTokenLimit('openai/gpt-4o', 'x'.repeat(102_401))).toThrow('has a limit of 102400');
  });

});

describe('clearAllJsDocs', () => {

  const source = `
/** class doc */
export class A {
  /** public prop */
  p = 1;
  /** private prop */
  private q = 2;
  /** public method */
  m() {}
  /** private method */
  private n() {}
}
/** interface doc */
export interface I {
  /** prop */
  a: string;
  /** method */
  b(): void;
}
/** alias */
export type T = string;
/** fn */
export function f() {}
`;

  it('should clear public js docs of a source file in a clone', () => {
    const sf = create(source);
    const clone = clearAllJsDocs(sf);
    const text = clone.getFullText();
    expect(text).not.toContain('class doc');
    expect(text).not.toContain('public prop');
    expect(text).not.toContain('public method');
    expect(text).not.toContain('interface doc');
    expect(text).not.toContain('alias');
    expect(text).not.toContain('/** fn */');
    expect(text).toContain('private prop');
    expect(text).toContain('private method');
    expect(sf.getFullText()).toContain('class doc');
  });

  it('should clear in place', () => {
    const sf = create(source);
    expect(clearAllJsDocs(sf, true)).toBe(sf);
    expect(sf.getFullText()).not.toContain('class doc');
  });

  it('should clear a class', () => {
    const cls = create(source).getClasses()[0];
    const clone = clearAllJsDocs(cls);
    expect(clone.getFullText()).not.toContain('class doc');
    expect(cls.getFullText()).toContain('class doc');
    clearAllJsDocs(cls, true);
    expect(cls.getFullText()).not.toContain('public method');
  });

  it('should clear an interface', () => {
    const iface = create(source).getInterfaces()[0];
    const clone = clearAllJsDocs(iface);
    expect(clone.getFullText()).not.toContain('method');
    expect(iface.getFullText()).toContain('/** method */');
    clearAllJsDocs(iface, true);
    expect(iface.getFullText()).not.toContain('/** prop */');
  });

  it('should throw for unsupported nodes', () => {
    const fn = create(source).getFunctions()[0];
    expect(fn.getKind()).toBe(SyntaxKind.FunctionDeclaration);
    expect(() => clearAllJsDocs(fn as any)).toThrow('Unrecognized source file');
  });

});

describe('composeContext', () => {

  it('should convert a source file', () => {
    const sf = create('/** doc */\nexport function a() {}', '/x.ts');
    const result = sourceFileToContextSourceFile(sf);
    expect(result.$.path).toBe('/x.ts');
    expect(result._).toContain('export function a');
    expect(result._).not.toContain('/** doc */');
  });

  it('should compose referenced and using files', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile('/dep.ts', 'export const dep = 1;');
    const main = project.createSourceFile('/main.ts', `import { dep } from './dep';\nexport const x = dep;`);
    project.createSourceFile('/user.ts', `import { x } from './main';\nexport const y = x;`);
    const xml = composeContext(main);
    expect(xml).toContain('<context>');
    expect(xml).toContain('path="/dep.ts"');
    expect(xml).toContain('path="/user.ts"');
  });

});
