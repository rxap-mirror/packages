import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import type { Mock } from 'vitest';
import { KeycloakService } from '../services/keycloak.service';
import { KeycloakBearerInterceptor } from './keycloak-bearer-interceptor';

describe('KeycloakBearerInterceptor', () => {
  let kc: any;
  let next: Mock;

  beforeEach(() => {
    kc = {
      enableBearerInterceptor: true,
      excludedUrls: [],
      isLoggedIn: vi.fn().mockResolvedValue(true),
      addTokenToHeader: vi.fn((h: HttpHeaders) => of(h.set('Authorization', 'Bearer t'))),
    };
    next = vi.fn((req: HttpRequest<unknown>) => of(req as any));
    TestBed.configureTestingModule({ providers: [{ provide: KeycloakService, useValue: kc }] });
  });

  const run = (req: HttpRequest<unknown>) =>
    TestBed.runInInjectionContext(() => firstValueFrom(KeycloakBearerInterceptor(req, next as any))) as unknown as Promise<HttpRequest<unknown>>;

  it('passes the request untouched if disabled', async () => {
    kc.enableBearerInterceptor = false;
    const req = new HttpRequest('GET', '/api');
    expect(await run(req)).toBe(req);
    expect(kc.isLoggedIn).not.toHaveBeenCalled();
  });

  it('skips excluded urls (any method)', async () => {
    kc.excludedUrls = [{ urlPattern: /assets/i, httpMethods: [] }];
    const req = new HttpRequest('GET', '/assets/x');
    expect(await run(req)).toBe(req);
  });

  it('skips excluded urls only for matching methods', async () => {
    kc.excludedUrls = [{ urlPattern: /api/i, httpMethods: ['GET'] }];
    const get = new HttpRequest('GET', '/api');
    expect(await run(get)).toBe(get);
    const post = await run(new HttpRequest('POST', '/api', {}));
    expect(post.headers.get('Authorization')).toBe('Bearer t');
  });

  it('adds the token when logged in', async () => {
    const out = await run(new HttpRequest('GET', '/api'));
    expect(out.headers.get('Authorization')).toBe('Bearer t');
  });

  it('passes the request untouched when not logged in', async () => {
    kc.isLoggedIn.mockResolvedValue(false);
    const req = new HttpRequest('GET', '/api');
    expect(await run(req)).toBe(req);
  });
});
