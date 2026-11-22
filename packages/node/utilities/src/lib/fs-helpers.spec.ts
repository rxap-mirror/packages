import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CopyFolderSync } from './copy-folder-sync';
import { EachDirSync } from './each-dir-sync';
import { GetGitIgnorePatterns } from './get-git-ignore-patterns';
import { jsonFile, jsonFileWithRetry, writeJsonFile } from './json-file';
import { RemoveDirSync } from './remove-dir-sync';
import { SearchFileInDirectory } from './search-file-in-directory';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'node-utils-'));
  mkdirSync(join(root, 'a', 'b'), { recursive: true });
  writeFileSync(join(root, 'top.txt'), 'top');
  writeFileSync(join(root, 'a', 'one.txt'), 'one');
  writeFileSync(join(root, 'a', 'b', 'two.txt'), 'two');
});

describe('EachDirSync', () => {
  it('yields every file recursively', () => {
    expect([...EachDirSync(root)].sort()).toEqual(
      [join(root, 'a', 'b', 'two.txt'), join(root, 'a', 'one.txt'), join(root, 'top.txt')].sort(),
    );
  });
});

describe('SearchFileInDirectory', () => {
  it('yields content and path of all files', () => {
    const found = [...SearchFileInDirectory(root)];
    expect(found.map((f) => f.content).sort()).toEqual(['one', 'top', 'two']);
  });

  it('skips ignored entries', () => {
    const gitignore = { ignores: (f: string) => f === 'a' } as any;
    expect([...SearchFileInDirectory(root, gitignore)].map((f) => f.content)).toEqual(['top']);
  });
});

describe('GetGitIgnorePatterns', () => {
  it('returns null without .gitignore', () => {
    expect(GetGitIgnorePatterns(root)).toBeNull();
  });

  it('parses .gitignore patterns', () => {
    writeFileSync(join(root, '.gitignore'), 'node_modules\n*.log\n');
    const ig = GetGitIgnorePatterns(root)!;
    expect(ig.ignores('node_modules')).toBe(true);
    expect(ig.ignores('x.log')).toBe(true);
    expect(ig.ignores('x.ts')).toBe(false);
  });
});

describe('CopyFolderSync', () => {
  it('copies the tree', () => {
    const dest = join(mkdtempSync(join(tmpdir(), 'node-utils-dest-')), 'copy');
    CopyFolderSync(root, dest);
    expect(readFileSync(join(dest, 'a', 'b', 'two.txt'), 'utf-8')).toBe('two');
    expect(readdirSync(dest).sort()).toEqual(['a', 'top.txt']);
  });
});

describe('RemoveDirSync', () => {
  it('removes the directory with its content', () => {
    RemoveDirSync(root);
    expect(existsSync(root)).toBe(false);
  });

  it('throws for a missing directory', () => {
    expect(() => RemoveDirSync(join(root, 'missing'))).toThrow();
  });
});

describe('json file helpers', () => {
  it('writes with trailing newline and reads back', () => {
    const file = join(root, 'x.json');
    writeJsonFile(file, { a: 1 });
    expect(readFileSync(file, 'utf-8')).toBe('{\n  "a": 1\n}\n');
    expect(jsonFile(file)).toEqual({ a: 1 });
  });

  it('jsonFile rejects missing and invalid files', () => {
    expect(() => jsonFile(join(root, 'nope.json'))).toThrow('does not exist');
    writeFileSync(join(root, 'bad.json'), '{');
    expect(() => jsonFile(join(root, 'bad.json'))).toThrow('Could not parse');
  });

  it('jsonFileWithRetry reads valid files', async () => {
    writeJsonFile(join(root, 'ok.json'), { b: 2 });
    await expect(jsonFileWithRetry(join(root, 'ok.json'))).resolves.toEqual({ b: 2 });
  });

  it('jsonFileWithRetry fails on a missing file', async () => {
    await expect(jsonFileWithRetry(join(root, 'nope.json'))).rejects.toThrow('not found');
  });

  it('jsonFileWithRetry retries and finally fails', async () => {
    writeFileSync(join(root, 'bad.json'), '{');
    await expect(jsonFileWithRetry(join(root, 'bad.json'), 2, 1)).rejects.toThrow('Failed to parse json file');
  });
});
