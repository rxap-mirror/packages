import { writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ANGULAR_VERSION, GetWorkspaceAngularVersion } from './angular-version';

describe('GetWorkspaceAngularVersion', () => {

  it('falls back to ANGULAR_VERSION without @angular/core', () => {
    expect(GetWorkspaceAngularVersion(createTreeWithEmptyWorkspace())).toBe(ANGULAR_VERSION);
  });

  it('uses the root package.json range if @angular/core is not installed', () => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { dependencies: { '@angular/core': '~22.2.0' } });
    expect(GetWorkspaceAngularVersion(tree)).toBe('~22.2.0');
  });

  it('prefers the installed @angular/core version', () => {
    const root = mkdtempSync(join(tmpdir(), 'ng-version-'));
    mkdirSync(join(root, 'node_modules', '@angular', 'core'), { recursive: true });
    writeFileSync(join(root, 'node_modules', '@angular', 'core', 'package.json'), JSON.stringify({ version: '22.2.7' }));
    const tree = createTreeWithEmptyWorkspace();
    Object.defineProperty(tree, 'root', { value: root });
    writeJson(tree, 'package.json', { dependencies: { '@angular/core': '~22.2.0' } });
    expect(GetWorkspaceAngularVersion(tree)).toBe('22.2.7');
  });

});
