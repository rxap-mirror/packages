import { SetObjectValue } from './set-object-value';

describe('@rxap/utilities', () => {

  describe('SetObjectValue(obj, path, value)', () => {

    it('empty path', () => {

      const obj = {};
      SetObjectValue(obj, '', 'value');
      expect(obj).toEqual({});

    });

    it('not object', () => {
      SetObjectValue(undefined, '', 'value');
    });

    it('path deep 1', () => {

      const obj = {};
      SetObjectValue(obj, 'key', 'value');
      expect(obj).toEqual({ key: 'value' });

    });

    it('path deep 2', () => {

      const obj = {};
      SetObjectValue(obj, 'key.sub', 'value');
      expect(obj).toEqual({ key: { sub: 'value' } });

    });

    it('path deep 2 with data', () => {

      const obj = {
        key: { test: 'value' },
        side: 'value',
      };
      SetObjectValue(obj, 'key.sub', 'value');
      expect(obj)
        .toEqual({
          key: {
            sub: 'value',
            test: 'value',
          },
          side: 'value',
        });

    });

  });

});
