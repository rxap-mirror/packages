import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as Sentry from '@sentry/angular';
import { AnyHttpErrorService } from './any-http-error/any-http-error.service';
import { CodeHttpErrorService } from './code-http-error/code-http-error.service';
import { ErrorInterceptorOptions } from './error-interceptor-options';
import { HttpErrorInterceptor } from './http-error-interceptor';
import { MessageHttpErrorService } from './message-http-error/message-http-error.service';
import { RXAP_ERROR_INTERCEPTOR_OPTIONS } from './tokens';

jest.mock('@sentry/angular', () => ({ captureMessage: jest.fn() }));

describe('HttpErrorInterceptor', () => {
  const any = { push: jest.fn() };
  const message = { push: jest.fn() };
  const code = { push: jest.fn() };
  let http: HttpClient;
  let ctrl: HttpTestingController;

  function setup(options?: ErrorInterceptorOptions) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([HttpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AnyHttpErrorService, useValue: any },
        { provide: MessageHttpErrorService, useValue: message },
        { provide: CodeHttpErrorService, useValue: code },
        ...(options ? [{ provide: RXAP_ERROR_INTERCEPTOR_OPTIONS, useValue: options }] : []),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  }

  const fail = async (body: any, status = 500, url = '/api/x') => {
    http.post(url, { b: 1 }).subscribe({ error: () => undefined });
    ctrl.expectOne(url).flush(body, { status, statusText: 'ERR' });
    await new Promise((r) => setTimeout(r));
  };

  // jsdom does not implement Blob.text
  const blob = (content: string) => {
    const b = new Blob([content]);
    (b as any).text = async () => content;
    return b;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('passes successful responses', async () => {
    setup();
    await fail({}, 200);
    expect(any.push).not.toHaveBeenCalled();
  });

  it('ignores errors rejected by the filter', async () => {
    setup();
    await fail({}, 500, '/api/status');
    await fail({}, 399);
    expect(any.push).not.toHaveBeenCalled();
  });

  it('pushes code errors with sentry capture', async () => {
    setup();
    await fail({ code: 'E1', message: 'm' });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Error Code E1', expect.objectContaining({ level: 'warning' }));
    expect(code.push).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'E1', method: 'POST', body: { b: 1 } }));
  });

  it('pushes message errors', async () => {
    setup();
    await fail({ message: 'hello' });
    expect(message.push).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }));
  });

  it('pushes object errors without message as any errors', async () => {
    setup();
    await fail({ foo: 1 });
    expect(any.push).toHaveBeenCalled();
  });

  it('pushes non object errors as any errors', async () => {
    setup();
    await fail('plain', 500);
    expect(any.push).toHaveBeenCalledTimes(1);
  });

  it('parses json blobs', async () => {
    setup();
    http.get('/b', { responseType: 'blob' }).subscribe({ error: () => undefined });
    ctrl.expectOne('/b').flush(blob(JSON.stringify({ message: 'blob msg' })), { status: 500, statusText: 'ERR' });
    await new Promise((r) => setTimeout(r, 20));
    expect(message.push).toHaveBeenCalled();
  });

  it('keeps non json blobs', async () => {
    setup();
    http.get('/b', { responseType: 'blob' }).subscribe({ error: () => undefined });
    ctrl.expectOne('/b').flush(blob('not json'), { status: 500, statusText: 'ERR' });
    await new Promise((r) => setTimeout(r, 20));
    expect(any.push).toHaveBeenCalled();
  });

  it('honors custom options', async () => {
    setup({ filter: [(e) => e.status === 418], extractErrorCode: (e) => e.error.custom });
    await fail({ custom: 'C' }, 500);
    expect(code.push).not.toHaveBeenCalled();
    await fail({ custom: 'C' }, 418);
    expect(code.push).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'C' }));
  });
});
