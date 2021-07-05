import { deepMerge } from './deep-merge';

describe('Utilities', () => {

  describe('deep merge', () => {

    it('merge primitive values', () => {

      expect(deepMerge<boolean>(true, false)).toBe(false);
      expect(deepMerge<boolean>(false, true)).toBe(true);
      expect(deepMerge<number>(0, 1)).toBe(1);
      expect(deepMerge<number>(1, 0)).toBe(0);
      expect(deepMerge<number>(42, 1)).toBe(1);
      expect(deepMerge<string>('', 'test')).toBe('test');
      expect(deepMerge<string>('test', '')).toBe('');
      expect(deepMerge<string>('test', 'test2')).toBe('test2');
      expect(deepMerge<any>(null, undefined)).toBe(undefined);
      expect(deepMerge<any>({}, null)).toBe(null);

    });

    it('merge object values', () => {

      expect(deepMerge({ a: 'test', b: 'nop' }, { b: 'test' })).toEqual({ a: 'test', b: 'test' });
      expect(deepMerge({ a: 'test', b: { a: 'test' } }, { b: 'test' as any })).toEqual({ a: 'test', b: 'test' });

    });

    it('merge array values', () => {

      expect(deepMerge([], [])).toEqual([]);
      expect(deepMerge([ 'a' ], [])).toEqual([ 'a' ]);
      expect(deepMerge([ 'a' ], [ 'b' ])).toEqual([ 'b' ]);

    });

    it('should merge objects with empty arrays', () => {

      expect(deepMerge(
        { runner: [] },
        { runner: [] }
      )).toEqual({ runner: [] });

    });

    it('merge array with empty values', () => {

      const a: any[] = [];
      const b: any[] = [];

      expect(deepMerge(a, b)).toEqual([]);

      a[ 0 ] = 'test';

      expect(deepMerge(a, b)).toEqual([ 'test' ]);

      b[ 1 ] = 'b';
      b[ 2 ] = 'b';

      expect(deepMerge(a, b)).toEqual([ 'test', 'b', 'b' ]);


    });

  });

});
