import {getFromObject} from './get-from-object';

describe('@rxap/utilities', () => {

  describe('getFromObject(obj, path, defaultValue?)', () => {

    it('should return defaultValue if passed obj is not a object or undefined', () => {

      expect(getFromObject(null as any, 'test.path', 'default')).toEqual('default');
      expect(getFromObject(undefined as any, 'test.path', 'default')).toEqual('default');
      expect(getFromObject(0 as any, 'test.path', 'default')).toEqual('default');
      expect(getFromObject('my string' as any, 'test.path', 'default')).toEqual('default');
      expect(getFromObject(true as any, 'test.path', 'default')).toEqual('default');

    });

    it('should return defaultValue if passed path is not in the object', () => {

      expect(getFromObject({}, 'test.path', 'default')).toEqual('default');
      expect(getFromObject({test: {}}, 'test', 'default')).toEqual({});
      expect(getFromObject({test: {}}, 'test.path', 'default')).toEqual('default');
      expect(getFromObject({use: {}}, 'test.path', 'default')).toEqual('default');
      expect(getFromObject({test: {use: {}}}, 'test.path', 'default')).toEqual('default');

    });

    it('should return value if passed path is in the object', () => {

      expect(getFromObject({test: 'value'}, 'test', 'default')).toEqual('value');
      expect(getFromObject({test: {path: 'value'}}, 'test.path', 'default')).toEqual('value');
      expect(getFromObject({test: 'value'}, '', 'default')).toEqual({test: 'value'});

    });

  });

});
