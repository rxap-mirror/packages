import { HttpErrorResponse } from '@angular/common/http';
import {
  DefaultErrorCodeExtractor,
  DefaultErrorFilter,
} from './error-interceptor-options';

describe('error-interceptor-options', () => {
  it('extracts the error code', () => {
    expect(DefaultErrorCodeExtractor(new HttpErrorResponse({ error: { code: 'E1' } }))).toBe('E1');
    expect(DefaultErrorCodeExtractor(new HttpErrorResponse({ error: {} }))).toBeNull();
    expect(DefaultErrorCodeExtractor(new HttpErrorResponse({}))).toBeNull();
  });

  it('filters by status and ignores status endpoint', () => {
    expect(DefaultErrorFilter(new HttpErrorResponse({ status: 500, url: 'http://a/b' }))).toBe(true);
    expect(DefaultErrorFilter(new HttpErrorResponse({ status: 500 }))).toBe(true);
    expect(DefaultErrorFilter(new HttpErrorResponse({ status: 200 }))).toBe(false);
    expect(DefaultErrorFilter(new HttpErrorResponse({ status: 500, url: 'http://a/api/status' }))).toBe(false);
  });
});
