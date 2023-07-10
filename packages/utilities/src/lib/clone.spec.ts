import { clone } from './clone';

describe('@rxap/utilities', () => {
  describe('clone', () => {
    it('should clone value', () => {
      expect(clone(true)).toEqual(true);
      expect(clone(false)).toEqual(false);
      expect(clone('value')).toEqual('value');
      expect(clone(0)).toEqual(0);
      expect(clone(-1)).toEqual(-1);
      expect(clone(1)).toEqual(1);
      expect(clone({})).toEqual({});
      expect(clone([])).toEqual([]);
      expect(clone([{}])).toEqual([{}]);
      expect(clone({key: 'value'})).toEqual({key: 'value'});
      expect(clone({key: false})).toEqual({key: false});
      expect(clone({key: true})).toEqual({key: true});
      expect(clone({key: 0})).toEqual({key: 0});
      expect(clone({key: 1})).toEqual({key: 1});
      expect(clone({key: -1})).toEqual({key: -1});
      expect(clone({key: -1, sub: {k: 'v'}})).toEqual({
        key: -1,
        sub: {k: 'v'},
      });
      expect(clone({key: -1, sub: {k: ['v']}})).toEqual({
        key: -1,
        sub: {k: ['v']},
      });
    });

    it('should deep clone object', () => {
      const obj1 = {key: 'value'};
      const cloneObj1 = clone(obj1);

      expect(obj1).toEqual(cloneObj1);
      expect(obj1).not.toBe(cloneObj1);

      obj1.key = 'new';
      expect(cloneObj1.key).toBe('value');
    });
  });
});
