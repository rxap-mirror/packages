import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { GetAutoTag } from './get-auto-tag';
import { LoadKeysFromFile } from './load-keys-from-file';
import { NormalizeTag } from './normalize-tag';

describe('localazy lib', () => {

  const keys = [ 'CI_COMMIT_REF_PROTECTED', 'CI_COMMIT_REF_SLUG', 'LOCALAZY_KEY_MAP' ];
  const saved: Record<string, string | undefined> = {};
  let dir: string;

  beforeEach(() => {
    for (const key of keys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    dir = mkdtempSync(join(tmpdir(), 'localazy-'));
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    for (const key of keys) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
    rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe('NormalizeTag', () => {
    it('should replace invalid characters and lowercase', () => {
      expect(NormalizeTag('Feature/My Branch_1.0')).toBe('feature-my-branch_1.0');
    });
  });

  describe('GetAutoTag', () => {
    it('should return null if the ref is not protected', () => {
      process.env['CI_COMMIT_REF_SLUG'] = 'main';
      expect(GetAutoTag()).toBeNull();
    });

    it('should return the slug for protected refs', () => {
      process.env['CI_COMMIT_REF_PROTECTED'] = 'true';
      process.env['CI_COMMIT_REF_SLUG'] = 'main';
      expect(GetAutoTag()).toBe('main');
    });

    it('should return null without slug', () => {
      process.env['CI_COMMIT_REF_PROTECTED'] = 'true';
      expect(GetAutoTag()).toBeNull();
    });
  });

  describe('LoadKeysFromFile', () => {
    function mapFile(content: string) {
      const file = join(dir, 'map.json');
      writeFileSync(file, content);
      process.env['LOCALAZY_KEY_MAP'] = file;
    }

    it('should return empty without project name or env', () => {
      expect(LoadKeysFromFile('')).toEqual({});
      expect(LoadKeysFromFile('app')).toEqual({});
    });

    it('should return empty if the file does not exist', () => {
      process.env['LOCALAZY_KEY_MAP'] = join(dir, 'missing.json');
      expect(LoadKeysFromFile('app')).toEqual({});
    });

    it('should read a string entry as write key', () => {
      mapFile('{"app":"w"}');
      expect(LoadKeysFromFile('app')).toEqual({ read: null, write: 'w' });
    });

    it('should read an object entry', () => {
      mapFile('{"app":{"read":"r","write":"w"}}');
      expect(LoadKeysFromFile('app')).toEqual({ read: 'r', write: 'w' });
    });

    it('should return empty for unknown projects and invalid json', () => {
      mapFile('{"other":"w"}');
      expect(LoadKeysFromFile('app')).toEqual({});
      mapFile('not json');
      expect(LoadKeysFromFile('app')).toEqual({});
    });
  });

});
