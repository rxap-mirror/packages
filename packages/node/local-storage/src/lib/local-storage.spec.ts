import {
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from 'fs';
import { join } from 'path';
import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  const testFolder = join(__dirname, '../../tmp-test-storage');

  beforeEach(() => {
    if (existsSync(testFolder)) {
      rmSync(testFolder, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(testFolder)) {
      rmSync(testFolder, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {

    it('should create the storage folder if it does not exists', () => {
      const storage = new LocalStorage(testFolder);
      expect(existsSync(testFolder)).toBeTruthy();
    });

    it('should throw an error if the storage folder is not a directory', () => {
      // Ensure parent directory exists
      const parentDir = join(testFolder, '..');
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }
      const testFilePath = join(testFolder);
      writeFileSync(testFilePath, 'test');
      expect(() => new LocalStorage(testFilePath)).toThrowError(`The storage folder '${testFilePath}' is not a directory`);
    });

    it('should populate the cache with the files in the storage folder', () => {
      mkdirSync(testFolder, { recursive: true });
      writeFileSync(join(testFolder, 'test'), 'test');
      const storage = new LocalStorage(testFolder);
      expect(storage.getItem('test')).toEqual('test');
    });

  });

  describe('length', () => {

    it('should return the size of the cache', () => {
      const storage = new LocalStorage(testFolder);
      expect(storage.length).toEqual(0);
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
    });

  });

  describe('clear', () => {

    it('should clear the cache', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
      storage.clear();
      expect(storage.length).toEqual(0);
    });

  });

  describe('getItem', () => {

    it('should return null if the key does not exists', () => {
      const storage = new LocalStorage(testFolder);
      expect(storage.getItem('test')).toBeNull();
    });

    it('should return the value of the key', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

    it('should read the file from the storage folder if the key does not exists in the cache', () => {
      const storage = new LocalStorage(testFolder);
      writeFileSync(join(testFolder, 'test'), 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

  });

  describe('key', () => {

    it('should return null if the index is out of range', () => {
      const storage = new LocalStorage(testFolder);
      expect(storage.key(0)).toBeNull();
    });

    it('should return the key at the index', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(storage.key(0)).toEqual('test');
    });

  });

  describe('removeItem', () => {

    it('should remove the key from the cache', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
      storage.removeItem('test');
      expect(storage.length).toEqual(0);
    });

    it('should remove the file from the storage folder', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(existsSync(join(testFolder, 'test'))).toBeTruthy();
      storage.removeItem('test');
      expect(existsSync(join(testFolder, 'test'))).toBeFalsy();
    });

  });

  describe('setItem', () => {

    it('should set the key in the cache', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

    it('should write the file to the storage folder', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      expect(existsSync(join(testFolder, 'test'))).toBeTruthy();
    });

    it('should overwrite the file in the storage folder', () => {
      const storage = new LocalStorage(testFolder);
      storage.setItem('test', 'test');
      storage.setItem('test', 'test1');
      expect(existsSync(join(testFolder, 'test'))).toBeTruthy();
      expect(storage.getItem('test')).toEqual('test1');
    });

  });

});
