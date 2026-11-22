import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ExistsFileWithScope, InjectScopeInFilePath, ReadFileWithScope } from './file-with-scope';

describe('InjectScopeInFilePath', () => {
  it('returns the path unchanged without scope', () => {
    expect(InjectScopeInFilePath('a/b.json')).toBe('a/b.json');
    expect(InjectScopeInFilePath('a/b.json', '')).toBe('a/b.json');
  });

  it('injects the dasherized scope before the extension', () => {
    expect(InjectScopeInFilePath('a/b.json', 'MyScope')).toBe('a/b.my-scope.json');
  });

  it('appends the scope when there is no extension', () => {
    expect(InjectScopeInFilePath('config', 'dev')).toBe('config.dev');
  });
});

describe('file with scope', () => {
  let dir: string;
  const logger = { log: jest.fn() };
  const file = (name: string, content = name) => {
    writeFileSync(join(dir, name), content);
    return join(dir, name);
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'scope-'));
    logger.log.mockClear();
  });

  it('ExistsFileWithScope checks scoped, production and plain files', () => {
    const base = join(dir, 'c.json');
    expect(ExistsFileWithScope(base, 'dev')).toBe(false);
    file('c.dev.json');
    expect(ExistsFileWithScope(base, 'dev')).toBe(true);
    expect(ExistsFileWithScope(base, 'other')).toBe(false);
    file('c.production.json');
    expect(ExistsFileWithScope(base, 'other')).toBe(false);
    expect(ExistsFileWithScope(base, 'other', true)).toBe(true);
    file('c.json');
    expect(ExistsFileWithScope(base, 'other')).toBe(true);
  });

  it('ReadFileWithScope prefers the scoped file', () => {
    file('c.json', 'plain');
    file('c.dev.json', 'scoped');
    expect(ReadFileWithScope(join(dir, 'c.json'), 'dev', false, 'utf-8', logger)).toBe('scoped');
    expect(logger.log).toHaveBeenCalled();
  });

  it('ReadFileWithScope falls back to the plain file', () => {
    file('c.json', 'plain');
    expect(ReadFileWithScope(join(dir, 'c.json'), 'dev', false, 'utf-8', logger)).toBe('plain');
    expect(ReadFileWithScope(join(dir, 'c.json'), undefined, undefined, 'utf-8', logger)).toBe('plain');
  });

  it('ReadFileWithScope uses the production file in production', () => {
    file('c.json', 'plain');
    file('c.production.json', 'prod');
    expect(ReadFileWithScope(join(dir, 'c.json'), 'dev', true, 'utf-8', logger)).toBe('prod');
  });

  it('ReadFileWithScope falls back to the plain file when no production file exists', () => {
    file('c.json', 'plain');
    expect(ReadFileWithScope(join(dir, 'c.json'), 'dev', true, 'utf-8', logger)).toBe('plain');
  });

  it('ReadFileWithScope reads a production file even without a plain file', () => {
    file('c.production.json', 'prod');
    expect(ReadFileWithScope(join(dir, 'c.json'), 'dev', true, 'utf-8', logger)).toBe('prod');
  });

  it('ReadFileWithScope throws if nothing exists', () => {
    expect(() => ReadFileWithScope(join(dir, 'c.json'), 'dev', true, 'utf-8', logger)).toThrow('does not exists');
  });
});
