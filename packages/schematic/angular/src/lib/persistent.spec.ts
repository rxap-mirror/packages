import {
  IsKeyPersistent,
  IsPropertyPersistent,
  IsNormalizedKeyPersistent,
  IsNormalizedPropertyPersistent,
  NormalizePersistent,
  PersistentStorageProvider,
} from './persistent';
import { NormalizeDataProperty } from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p, type) => `normalized-${p}-${type}`),
}));

describe('Persistent Utilities', () => {
  describe('IsKeyPersistent', () => {
    it('should return true for key persistent objects', () => {
      expect(IsKeyPersistent({ key: 'test' })).toBe(true);
    });
    it('should return false if key is missing', () => {
      expect(IsKeyPersistent({ property: 'test' } as any)).toBe(false);
    });
  });

  describe('IsPropertyPersistent', () => {
    it('should return true for property persistent objects', () => {
      expect(IsPropertyPersistent({ property: 'test' } as any)).toBe(true);
    });
    it('should return false if property is missing', () => {
      expect(IsPropertyPersistent({ key: 'test' } as any)).toBe(false);
    });
  });

  describe('NormalizePersistent', () => {
    it('should normalize key persistent', () => {
      const result = NormalizePersistent({ key: 'my-key' });
      expect(result).toEqual({
        storage: PersistentStorageProvider.LocalStorage,
        key: 'my-key',
      });
    });

    it('should normalize property persistent', () => {
      const result = NormalizePersistent({ property: 'my-prop' as any });
      expect(result).toEqual({
        storage: PersistentStorageProvider.LocalStorage,
        property: 'normalized-my-prop-string',
      });
      expect(NormalizeDataProperty).toHaveBeenCalledWith('my-prop', 'string');
    });

    it('should throw error for invalid object', () => {
      expect(() => NormalizePersistent({} as any)).toThrow('Invalid persistent object');
    });
  });

  describe('IsNormalizedKeyPersistent', () => {
    it('should return true for normalized key persistent', () => {
      expect(IsNormalizedKeyPersistent({ storage: PersistentStorageProvider.LocalStorage, key: 'test' })).toBe(true);
    });
  });

  describe('IsNormalizedPropertyPersistent', () => {
    it('should return true for normalized property persistent', () => {
      expect(IsNormalizedPropertyPersistent({ storage: PersistentStorageProvider.LocalStorage, property: 'test' as any })).toBe(true);
    });
  });
});
