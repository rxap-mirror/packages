import {
  MockStorage,
  StorageSet,
} from '../storage-utility';
import { WebStorage } from './web-storage';

describe('WebStorage', () => {

  it('should use initial value if storage value does not exists', () => {

    const mockStorage: Storage = new MockStorage();

    class Test {

      @WebStorage(mockStorage)
      property: string | undefined = 'test';

    }

    const test = new Test();

    expect(test.property).toEqual('test');

  });

  it('should use storage value as initial value if available', () => {

    const mockStorage: Storage = new MockStorage();

    class Test {

      @WebStorage(mockStorage)
      property: string | undefined = 'test';

    }

    StorageSet(mockStorage, 'property', 'value');

    const test = new Test();

    expect(mockStorage.getItem('property')).toEqual('{"_expired":0,"_value":"value"}');

    expect(test.property).toEqual('value');

  });

  it('should storage value if set', () => {

    const mockStorage: Storage = new MockStorage();

    class Test {

      @WebStorage(mockStorage)
      property: string | undefined = 'test';

    }

    const test = new Test();

    test.property = 'storage';

    expect(mockStorage.getItem('property')).toEqual('{"_expired":0,"_value":"storage"}');

  });

  it('should remove storage value if set to undefined', () => {

    const mockStorage: Storage = new MockStorage();

    class Test {

      @WebStorage(mockStorage)
      property: string | undefined = 'test';

    }

    StorageSet(mockStorage, 'property', 'value');

    const test = new Test();

    expect(test.property).toEqual('value');

    test.property = undefined;

    expect(mockStorage.getItem('property')).toBeNull();

  });

});
