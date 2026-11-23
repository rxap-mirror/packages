import { TestBed } from '@angular/core/testing';
import { OpenApiHttpResponseError } from '@rxap/open-api';
import * as Sentry from '@sentry/angular';
import { firstValueFrom, toArray } from 'rxjs';
import { StatusControllerHealthCheckRemoteMethod } from './openapi/remote-methods/status-controller-health-check.remote-method';
import { StatusCheckService } from './status-check.service';

vi.mock('@sentry/angular', () => ({ captureMessage: vi.fn() }));

describe('StatusCheckService', () => {
  const method = { call: vi.fn() };
  let service: StatusCheckService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [{ provide: StatusControllerHealthCheckRemoteMethod, useValue: method }],
    });
    service = TestBed.inject(StatusCheckService);
  });

  afterEach(() => vi.restoreAllMocks());

  const all = (names: string[]) => firstValueFrom(service.getStatus(names).pipe(toArray()));

  function httpError(status: number) {
    const e = Object.create(OpenApiHttpResponseError.prototype);
    const values: Record<string, any> = {
      status,
      message: 'msg',
      operationId: 'op',
      httpErrorResponse: { error: { status: 'error', info: {} } },
    };
    for (const [k, value] of Object.entries(values)) {
      Object.defineProperty(e, k, { value, configurable: true });
    }
    return e;
  }

  it('returns empty for no services', async () => {
    expect(await all([])).toEqual([{ status: 'empty' }]);
  });

  it('emits loading and then the result', async () => {
    method.call.mockResolvedValue({ status: 'ok' });
    const res = await all(['a', 'b']);
    expect(res[0]).toEqual({ status: 'loading', info: { a: { status: 'loading' }, b: { status: 'loading' } } });
    expect(res[1]).toEqual({ status: 'ok' });
    expect(method.call).toHaveBeenCalledWith({ parameters: { service: ['a', 'b'] } });
  });

  it('defaults a missing status to unknown', async () => {
    method.call.mockResolvedValue({});
    expect((await all(['a']))[1].status).toBe('unknown');
  });

  it('uses the response body of a 503', async () => {
    method.call.mockRejectedValue(httpError(503));
    const res = await all(['a']);
    expect(res[1]).toEqual({ status: 'error', info: {} });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('API is unhealthy', expect.anything());
  });

  it.each([
    [500, 'internal-server-error'],
    [502, 'bad-gateway'],
    [504, 'gateway-timeout'],
    [405, 'method-not-found'],
    [401, 'unauthorized'],
    [429, 'rate-limiting'],
    [418, 'unknown'],
  ])('maps http status %s to %s', async (code, expected) => {
    method.call.mockRejectedValue(httpError(code));
    const res = await all(['a']);
    expect(res[1].status).toBe(expected);
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
  });

  it('keeps fatal for non http errors', async () => {
    method.call.mockRejectedValue(new Error('network'));
    const res = await all(['a']);
    expect(res[1].status).toBe('fatal');
    expect(Sentry.captureMessage).toHaveBeenCalledWith('API status request failed: network', expect.anything());
  });
});
