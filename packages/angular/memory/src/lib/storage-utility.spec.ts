import {
  ExpiredUnit,
  getExpired,
  MockStorage,
  StorageGet,
  StorageSet,
  stringify,
} from './storage-utility';

describe('StorageUtility', () => {

  describe('StorageGet', () => {

    let mockStorage: Storage;

    beforeEach(() => {
      mockStorage = new MockStorage();
    });

    it('should return null when storage is null', () => {
      expect(StorageGet(null, 'someKey')).toBeNull();
    });

    it('should return null when key is undefined', () => {
      expect(StorageGet(mockStorage, 'undefinedKey')).toBeNull();
    });

    it('should return correct object value for a given key', () => {
      const objValue = { _value: 'someValue' };
      mockStorage.setItem('objectKey', JSON.stringify(objValue));
      expect(StorageGet(mockStorage, 'objectKey')).toBe('someValue');
    });

    it('should return null for an expired object', () => {
      const expiredObj = {
        _value: 'someValue',
        _expired: Date.now() - 1000,
      };
      mockStorage.setItem('expiredKey', JSON.stringify(expiredObj));
      expect(StorageGet(mockStorage, 'expiredKey')).toBeNull();
    });

    it('should return correct object value if not expired', () => {
      const nonExpiredObj = {
        _value: 'someValue',
        _expired: Date.now() + 1000,
      };
      mockStorage.setItem('nonExpiredKey', JSON.stringify(nonExpiredObj));
      expect(StorageGet(mockStorage, 'nonExpiredKey')).toBe('someValue');
    });

    it('should return null for an expired string value', () => {
      const expiredStr = JSON.stringify({
        _value: 'someValue',
        _expired: Date.now() - 1000,
      });
      mockStorage.setItem('expiredStrKey', expiredStr);
      expect(StorageGet(mockStorage, 'expiredStrKey')).toBeNull();
    });

    it('should return the object if `_expired` is not defined', () => {
      const objWithoutExpired = { _value: 'someValue' };
      mockStorage.setItem('objWithoutExpired', JSON.stringify(objWithoutExpired));
      expect(StorageGet(mockStorage, 'objWithoutExpired')).toBe('someValue');
    });

    it('should return the object if `_expired` is set to zero', () => {
      const objWithZeroExpired = {
        _value: 'someValue',
        _expired: 0,
      };
      mockStorage.setItem('objWithZeroExpired', JSON.stringify(objWithZeroExpired));
      expect(StorageGet(mockStorage, 'objWithZeroExpired')).toBe('someValue');
    });

    it('should return null if storage data is malformed', () => {
      mockStorage.setItem('malformedData', 'someRandomString');
      expect(StorageGet(mockStorage, 'malformedData')).toBeNull();
    });

  });

  describe('StorageSet', () => {

    let mockStorage: Storage;

    beforeEach(() => {
      mockStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        // Implement other required Storage methods if needed
      } as unknown as Storage;
    });

    it('should not set item when storage is null', () => {
      StorageSet(null, 'key', 'value');
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should set item in storage with default expiration', () => {
      const defaultExpired = getExpired(0, 't');
      StorageSet(mockStorage, 'key', 'value');
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'key', stringify({
          _expired: defaultExpired,
          _value: 'value',
        }));
    });

    it('should set item with custom expiration time in seconds', () => {
      const customExpired = getExpired(10, 's');
      StorageSet(mockStorage, 'key', 'value', 10, 's');
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'key', stringify({
          _expired: customExpired,
          _value: 'value',
        }));
    });

    it('should set item with custom expiration time in minutes', () => {
      const customExpired = getExpired(5, 'm');
      StorageSet(mockStorage, 'key', 'value', 5, 'm');
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'key', stringify({
          _expired: customExpired,
          _value: 'value',
        }));
    });

    it('should overwrite existing item in storage', () => {
      StorageSet(mockStorage, 'key', 'value1');
      StorageSet(mockStorage, 'key', 'value2');
      expect(mockStorage.setItem).toHaveBeenLastCalledWith(
        'key', stringify({
          _expired: 0,
          _value: 'value2',
        }));
    });

    it('should store complex data types like objects and arrays', () => {
      const complexData = {
        field1: [ 1, 2, 3 ],
        field2: 'text',
      };
      StorageSet(mockStorage, 'key', complexData);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'key', stringify({
          _expired: 0,
          _value: complexData,
        }));
    });

    it('should throw error for invalid ExpiredUnit', () => {
      // Assuming you handle errors in your function
      expect(() => StorageSet(mockStorage, 'key', 'value', 10, 'invalid' as ExpiredUnit)).toThrow();
    });

    it('should handle edge case of expiredAt being zero', () => {
      const zeroExpired = getExpired(0, 't');
      StorageSet(mockStorage, 'key', 'value', 0);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'key', stringify({
          _expired: zeroExpired,
          _value: 'value',
        }));
    });

  });

});
