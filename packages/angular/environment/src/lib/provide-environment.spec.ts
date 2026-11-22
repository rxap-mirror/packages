import { TestBed } from '@angular/core/testing';
import { ProvideEnvironment } from './provide-environment';
import { RXAP_ENVIRONMENT } from './environment/tokens';

describe('ProvideEnvironment', () => {
  it('provides the environment value', () => {
    const environment = { app: 'a', production: false };
    expect(ProvideEnvironment(environment)).toEqual({ provide: RXAP_ENVIRONMENT, useValue: environment });
    TestBed.configureTestingModule({ providers: [ProvideEnvironment(environment)] });
    expect(TestBed.inject(RXAP_ENVIRONMENT)).toBe(environment);
  });
});
