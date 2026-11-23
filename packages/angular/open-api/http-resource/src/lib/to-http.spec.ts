import { signal } from '@angular/core';
import { toHttpHeaders } from './to-http-headers';
import { toHttpParams } from './to-http-params';

describe('@rxap/open-api/http-resource', () => {

  describe('toHttpHeaders', () => {

    it('should return undefined for a missing record', () => {
      expect(toHttpHeaders(undefined)).toBeUndefined();
      expect(toHttpHeaders(null)).toBeUndefined();
    });

    it('should include no header by default', () => {
      expect(toHttpHeaders({ authorization: signal('token') })).toEqual({});
    });

    it('should only include the selected headers with the current signal values', () => {
      const trace = signal('trace-1');
      const record = {
        authorization: signal('token'),
        trace,
        ignored: signal('ignored'),
      };

      expect(toHttpHeaders(record, [ 'authorization', 'trace' ])).toEqual({
        authorization: 'token',
        trace: 'trace-1',
      });

      trace.set('trace-2');

      expect(toHttpHeaders(record, [ 'trace' ])).toEqual({ trace: 'trace-2' });
    });

  });

  describe('toHttpParams', () => {

    it('should return undefined for a missing record', () => {
      expect(toHttpParams(undefined)).toBeUndefined();
      expect(toHttpParams(null)).toBeUndefined();
    });

    it('should include no param by default', () => {
      expect(toHttpParams({ page: signal(1) })).toEqual({});
    });

    it('should only include the selected params as encoded signal values', () => {
      const search = signal('a b&c');
      const record = {
        search,
        page: signal(2),
        ignored: signal('ignored'),
      };

      expect(toHttpParams(record, [ 'search', 'page' ])).toEqual({
        search: 'a%20b%26c',
        page: '2',
      });

      search.set('x/y');

      expect(toHttpParams(record, [ 'search' ])).toEqual({ search: 'x%2Fy' });
    });

  });

});
