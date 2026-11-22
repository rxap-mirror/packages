import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { AnyHttpErrorComponent } from './any-http-error/any-http-error.component';
import { CodeHttpErrorComponent } from './code-http-error/code-http-error.component';
import { AngularErrorComponent } from './error/angular-error.component';
import { MessageHttpErrorComponent } from './message-http-error/message-http-error.component';
import { OpenApiHttpResponseErrorComponent } from './open-api-http-response-error/open-api-http-response-error.component';
import { RXAP_ERROR_DIALOG_ERROR } from './tokens';

const http = (extra: object = {}) => ({
  method: 'GET', body: { a: 1 }, error: { message: 'api failed' }, message: 'msg', name: 'HttpErrorResponse',
  timestamp: Date.now(), headers: { 'x-a': ['1'], 'x-b': ['1', '2'], 'x-c': [] }, status: 500, statusText: 'ERR',
  url: 'http://x', ok: false, type: 4, ...extra,
});

function create<T>(component: new () => T, error: any, production?: boolean) {
  TestBed.configureTestingModule({
    providers: [
      { provide: RXAP_ERROR_DIALOG_ERROR, useValue: error },
      ...(production === undefined ? [] : [{ provide: RXAP_ENVIRONMENT, useValue: { production } }]),
    ],
  });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

describe('http error components', () => {
  it('AnyHttpErrorComponent renders all rows in non production', () => {
    const fixture = create(AnyHttpErrorComponent, http(), false);
    const text = fixture.nativeElement.textContent;
    expect(fixture.componentInstance.isProduction).toBe(false);
    expect(text).toContain('500');
    expect(text).toContain('http://x');
    expect(text).toContain('x-b');
    expect(text).toContain('NONE');
    expect(fixture.nativeElement.querySelectorAll('rxap-json-viewer').length).toBe(2);
  });

  it('AnyHttpErrorComponent hides body and error in production and shows NONE for empty', () => {
    const fixture = create(AnyHttpErrorComponent, http({ error: null, body: null }), true);
    expect(fixture.componentInstance.isProduction).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('rxap-json-viewer').length).toBe(0);
  });

  it('AnyHttpErrorComponent renders NONE for missing body in dev', () => {
    const fixture = create(AnyHttpErrorComponent, http({ error: null, body: null }));
    expect(fixture.nativeElement.textContent).toContain('NONE');
  });

  it('MessageHttpErrorComponent shows message and expands details', () => {
    const fixture = create(MessageHttpErrorComponent, http(), false);
    expect(fixture.nativeElement.textContent).toContain('api failed');
    expect(fixture.nativeElement.querySelector('rxap-any-http-error')).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.showMore()).toBe(true);
    expect(fixture.nativeElement.querySelector('rxap-any-http-error')).not.toBeNull();
  });

  it('MessageHttpErrorComponent hides details in production', () => {
    const fixture = create(MessageHttpErrorComponent, http(), true);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('CodeHttpErrorComponent shows code and expands details', () => {
    const fixture = create(CodeHttpErrorComponent, http({ errorCode: 'E42' }), false);
    expect(fixture.nativeElement.textContent).toContain('E42');
    expect(fixture.nativeElement.textContent).toContain('api failed');
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('rxap-any-http-error')).not.toBeNull();
  });

  it('CodeHttpErrorComponent falls back to the message and hides details in production', () => {
    const fixture = create(CodeHttpErrorComponent, http({ errorCode: 1, error: {} }), true);
    expect(fixture.nativeElement.textContent).toContain('msg');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('OpenApiHttpResponseErrorComponent renders', () => {
    const fixture = create(OpenApiHttpResponseErrorComponent, http({ metadata: {}, operationId: 'op' }), false);
    expect(fixture.nativeElement.textContent).toContain('500');
  });
});

describe('AngularErrorComponent', () => {
  it('renders details when available', () => {
    const fixture = create(AngularErrorComponent, {
      name: 'TypeError', message: 'bad', stack: 'at x',
      tags: { t: '1' }, extra: { e: 1 }, contexts: { c: { d: 1 } },
    });
    const c = fixture.componentInstance;
    expect([c.hasTags, c.hasExtra, c.hasContexts]).toEqual([true, true, true]);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('TypeError');
    expect(text).toContain('bad');
    expect(text).toContain('at x');
    expect(text).toContain('Details');
  });

  it('renders minimal errors', () => {
    const fixture = create(AngularErrorComponent, { message: 'bad', tags: {}, extra: {}, contexts: {} });
    const c = fixture.componentInstance;
    expect([c.hasTags, c.hasExtra, c.hasContexts]).toEqual([false, false, false]);
    expect(fixture.nativeElement.textContent).not.toContain('Details');
  });
});
