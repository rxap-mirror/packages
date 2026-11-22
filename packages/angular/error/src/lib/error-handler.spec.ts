import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { OpenApiHttpResponseError } from '@rxap/open-api';
import * as Sentry from '@sentry/angular';
import { AngularErrorService } from './error/angular-error.service';
import {
  ErrorHandlerOptions,
  RXAP_ERROR_HANDLER_OPTIONS,
  RxapErrorHandler,
} from './error-handler';
import { OpenApiHttpResponseErrorService } from './open-api-http-response-error/open-api-http-response-error.service';

jest.mock('@sentry/angular', () => ({
  captureException: jest.fn(() => 'evt-ex'),
  captureMessage: jest.fn(() => 'evt-msg'),
  showReportDialog: jest.fn(),
}));

const devMode = jest.fn(() => true);
jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  isDevMode: () => devMode(),
}));

describe('RxapErrorHandler', () => {
  const angularPush = jest.fn();
  const openApiPush = jest.fn();
  const configGet = jest.fn((_: string, def: unknown) => def);

  function setup(options?: ErrorHandlerOptions, environment: any = { production: false, release: false }) {
    TestBed.configureTestingModule({
      providers: [
        RxapErrorHandler,
        { provide: RXAP_ERROR_HANDLER_OPTIONS, useValue: options ?? {} },
        { provide: RXAP_ENVIRONMENT, useValue: environment },
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: AngularErrorService, useValue: { push: angularPush } },
        { provide: OpenApiHttpResponseErrorService, useValue: { push: openApiPush } },
      ],
    });
    return TestBed.inject(RxapErrorHandler);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    jest.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'table').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('has default options token', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(RXAP_ERROR_HANDLER_OPTIONS)).toEqual({ logErrors: true });
  });

  it('captures exceptions and logs them', () => {
    const handler = setup();
    const error = new Error('boom');
    handler.handleError(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({ level: 'error' }));
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('captures string errors as messages', () => {
    setup().handleError('text');
    expect(Sentry.captureMessage).toHaveBeenCalledWith('text', expect.anything());
  });

  it('unwraps ngOriginalError', () => {
    const inner = new Error('inner');
    setup().handleError({ ngOriginalError: inner });
    expect(Sentry.captureException).toHaveBeenCalledWith(inner, expect.anything());
  });

  it('does not log when logErrors is false', () => {
    setup({ logErrors: false }).handleError(new Error('x'));
    expect(console.error).not.toHaveBeenCalled();
  });

  it('shows the angular error dialog for non release environments', () => {
    const error = new Error('boom');
    setup().handleError(error);
    expect(angularPush).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom', name: 'Error', stack: error.stack }));
  });

  it('shows the dialog for string errors', () => {
    setup().handleError('plain');
    expect(angularPush).toHaveBeenCalledWith(expect.objectContaining({ message: 'plain' }));
  });

  it('does not show a dialog for http errors or unknown values', () => {
    const handler = setup();
    handler.handleError(new HttpErrorResponse({ status: 500 }));
    expect(angularPush).not.toHaveBeenCalled();
    handler.handleError(42);
    expect(angularPush).toHaveBeenCalledWith(expect.objectContaining({ message: 'Handled unknown error' }));
  });

  it('does not show a dialog for release environments', () => {
    setup({}, { production: true, tier: 'production', tag: 'v1.0.0' }).handleError(new Error('x'));
    expect(angularPush).not.toHaveBeenCalled();
  });

  it('shows the open api dialog', () => {
    const response = new HttpErrorResponse({ status: 404, error: { message: 'nf' } });
    const error = new OpenApiHttpResponseError(response, { id: 'getX', serverId: 'srv', operation: { method: 'get' } } as any);
    setup().handleError(error);
    expect(openApiPush).toHaveBeenCalledWith(expect.objectContaining({
      operationId: 'getX', method: 'get', serverId: 'srv', status: 404,
    }));
  });

  it('uses unknown method for string or missing operations', () => {
    const response = new HttpErrorResponse({ status: 404 });
    setup().handleError(new OpenApiHttpResponseError(response, { id: 'op' } as any));
    expect(openApiPush).toHaveBeenCalledWith(expect.objectContaining({ method: 'unknown' }));
  });

  it('shows the sentry report dialog outside dev mode', () => {
    devMode.mockReturnValue(false);
    configGet.mockImplementation((key: string, def: unknown) => key === 'sentry.showDialog' ? true : def);
    const handler = setup({});
    handler.handleError(new Error('x'));
    expect(Sentry.showReportDialog).toHaveBeenCalledWith(expect.objectContaining({ eventId: 'evt-ex' }));
    handler.handleError(new HttpErrorResponse({ status: 500 }));
    expect(Sentry.showReportDialog).toHaveBeenCalledTimes(1);
    expect(angularPush).not.toHaveBeenCalled();
    configGet.mockImplementation((_: string, def: unknown) => def);
    devMode.mockReturnValue(true);
  });

  it('warns and reloads the page on chunk load errors', () => {
    const handler = setup();
    handler.handleError(new Error('Loading chunk 12 failed.'));
    handler.handleError({ name: 'ChunkLoadError' });
    handler.handleError('Loading chunk 1 failed');
    handler.handleError(null);
    expect(console.warn).toHaveBeenCalledTimes(3);
  });
});
