import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ResolveFromWorkspace } from './resolve-from-workspace';

describe('ResolveFromWorkspace', () => {

  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'resolve-from-workspace-')));
    mkdirSync(join(root, 'node_modules', 'only-in-workspace'), { recursive: true });
    writeFileSync(join(root, 'node_modules', 'only-in-workspace', 'package.json'), JSON.stringify({ name: 'only-in-workspace', main: 'index.js' }));
    writeFileSync(join(root, 'node_modules', 'only-in-workspace', 'index.js'), '');
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('resolves packages installed in the workspace root', () => {
    expect(ResolveFromWorkspace('only-in-workspace/package.json', root))
      .toBe(join(root, 'node_modules', 'only-in-workspace', 'package.json'));
    expect(ResolveFromWorkspace('only-in-workspace', root))
      .toBe(join(root, 'node_modules', 'only-in-workspace', 'index.js'));
  });

  it('throws for packages that are not installed in the workspace root', () => {
    expect(() => ResolveFromWorkspace('definitely-not-installed-pkg', root)).toThrow();
  });

});
