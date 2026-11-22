import { TestBed } from '@angular/core/testing';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';
import { GetFromObjectPipe } from './get-from-object.pipe';
import { JoinPipe } from './join.pipe';
import { LimitPipe } from './limit.pipe';
import { SlicePipe } from './slice.pipe';
import { TruncatePipe } from './truncate.pipe';
import { RxapCurrencyPipe } from './currency.pipe';

describe('pipes', () => {
  it('limit', () => {
    expect(new LimitPipe().transform([ 1, 2, 3 ], 2)).toEqual([ 1, 2 ]);
    expect(new LimitPipe().transform([ 1 ], 5)).toEqual([ 1 ]);
  });

  it('slice', () => {
    expect(new SlicePipe().transform([ 1, 2, 3, 4 ], 1)).toEqual([ 2, 3, 4 ]);
    expect(new SlicePipe().transform([ 1, 2, 3, 4 ], 1, 3)).toEqual([ 2, 3 ]);
  });

  it('join', () => {
    expect(new JoinPipe().transform([ 'a', 'b' ], '-')).toBe('a-b');
    expect(new JoinPipe().transform([ 'a', 'b' ])).toBe('a,b');
  });

  it('getFromObject', () => {
    expect(new GetFromObjectPipe().transform({ a: { b: 5 } }, 'a.b')).toBe(5);
  });

  it('truncate', () => {
    const p = new TruncatePipe();
    expect(p.transform(null)).toBe('');
    expect(p.transform(undefined)).toBe('');
    expect(p.transform('short', 10)).toBe('short');
    expect(p.transform('abcdefghij', 4)).toBe('abcd...');
    expect(p.transform('abcdefghij', 4, '~')).toBe('abcd~');
    expect(p.transform('a'.repeat(70))).toBe('a'.repeat(64) + '...');
  });

  describe('currency', () => {
    it('formats cents', () => {
      const pipe = TestBed.runInInjectionContext(() => new RxapCurrencyPipe());
      expect(pipe.transform(12345, 'USD')).toBe('$123.45');
    });

    it('uses default currency code', () => {
      TestBed.configureTestingModule({ providers: [ { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' } ] });
      const pipe = TestBed.runInInjectionContext(() => new RxapCurrencyPipe());
      expect(pipe.transform(500)).toContain('€5.00');
    });
  });
});
