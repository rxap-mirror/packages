import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { GetOauth2ProxyUserProfileMethod } from './get-oauth2-proxy-user-profile.method';
import { Oauth2ProxyUserProfileDataSource } from './oauth2-proxy-user-profile.data-source';

describe('GetOauth2ProxyUserProfileMethod', () => {
  let http: HttpTestingController;
  const config = { get: jest.fn((_key: string, def: string) => def) };

  beforeEach(() => {
    config.get.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: config },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the default profile url', async () => {
    const promise = TestBed.inject(GetOauth2ProxyUserProfileMethod).call();
    const req = http.expectOne('/oauth2/userinfo');
    expect(req.request.method).toBe('GET');
    req.flush({ user: 'u', email: 'u@x.de' });
    await expect(promise).resolves.toEqual({ user: 'u', email: 'u@x.de' });
    expect(config.get).toHaveBeenCalledWith('oauth2.profileUrl', '/oauth2/userinfo');
  });

  it('uses the configured profile url', async () => {
    config.get.mockReturnValue('/custom/me');
    const promise = TestBed.inject(GetOauth2ProxyUserProfileMethod).call();
    http.expectOne('/custom/me').flush({ user: 'a', email: 'b' });
    await expect(promise).resolves.toEqual({ user: 'a', email: 'b' });
  });

  it('data source is created and backed by the method', () => {
    const ds = TestBed.inject(Oauth2ProxyUserProfileDataSource);
    expect(ds).toBeInstanceOf(Oauth2ProxyUserProfileDataSource);
  });
});
