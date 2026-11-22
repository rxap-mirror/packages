import { HttpRequest, HttpResponse } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LanguageInterceptor } from './language-interceptor';

describe('LanguageInterceptor', () => {
  function run(providers: any[]) {
    TestBed.configureTestingModule({ providers });
    let seen: HttpRequest<unknown> | undefined;
    TestBed.runInInjectionContext(() =>
      LanguageInterceptor(new HttpRequest('GET', '/api'), (req) => {
        seen = req;
        return of(new HttpResponse());
      }).subscribe(),
    );
    return seen!;
  }

  it('sets the Accept-Language header from LOCALE_ID', () => {
    expect(run([{ provide: LOCALE_ID, useValue: 'de-DE' }]).headers.get('Accept-Language')).toBe('de-DE');
  });

  it('does not set the header without a locale', () => {
    expect(run([{ provide: LOCALE_ID, useValue: '' }]).headers.has('Accept-Language')).toBe(false);
  });
});
