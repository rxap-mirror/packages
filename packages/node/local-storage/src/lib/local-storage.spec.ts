import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import mockFs from 'mock-fs';
import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {

  beforeEach(() => {
    mockFs();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe('constructor', () => {

    it('should create the storage folder if it does not exists', () => {
      const storage = new LocalStorage('/test');
      expect(existsSync('/test')).toBeTruthy();
    });

    it('should throw an error if the storage folder is not a directory', () => {
      writeFileSync('/test', 'test');
      expect(() => new LocalStorage('/test')).toThrowError(`The storage folder '/test' is not a directory`);
    });

    it('should populate the cache with the files in the storage folder', () => {
      mkdirSync('/test');
      writeFileSync('/test/test', 'test');
      const storage = new LocalStorage('/test');
      expect(storage.getItem('test')).toEqual('test');
    });

  });

  describe('length', () => {

    it('should return the size of the cache', () => {
      const storage = new LocalStorage('/test');
      expect(storage.length).toEqual(0);
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
    });

  });

  describe('clear', () => {

    it('should clear the cache', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
      storage.clear();
      expect(storage.length).toEqual(0);
    });

  });

  describe('getItem', () => {

    it('should return null if the key does not exists', () => {
      const storage = new LocalStorage('/test');
      expect(storage.getItem('test')).toBeNull();
    });

    it('should return the value of the key', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

    it('should read the file from the storage folder if the key does not exists in the cache', () => {
      const storage = new LocalStorage('/test');
      writeFileSync('/test/test', 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

  });

  describe('key', () => {

    it('should return null if the index is out of range', () => {
      const storage = new LocalStorage('/test');
      expect(storage.key(0)).toBeNull();
    });

    it('should return the key at the index', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(storage.key(0)).toEqual('test');
    });

  });

  describe('removeItem', () => {

    it('should remove the key from the cache', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(storage.length).toEqual(1);
      storage.removeItem('test');
      expect(storage.length).toEqual(0);
    });

    it('should remove the file from the storage folder', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(existsSync('/test/test')).toBeTruthy();
      storage.removeItem('test');
      expect(existsSync('/test/test')).toBeFalsy();
    });

  });

  describe('setItem', () => {

    it('should set the key in the cache', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(storage.getItem('test')).toEqual('test');
    });

    it('should write the file to the storage folder', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      expect(existsSync('/test/test')).toBeTruthy();
    });

    it('should overwrite the file in the storage folder', () => {
      const storage = new LocalStorage('/test');
      storage.setItem('test', 'test');
      storage.setItem('test', 'test1');
      expect(existsSync('/test/test')).toBeTruthy();
      expect(storage.getItem('test')).toEqual('test1');
    });

  });

});
