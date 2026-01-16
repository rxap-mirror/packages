import { RXAP_DISABLE_AUTHORIZATION, RXAP_AUTHORIZATION_SCOPE } from './tokens';
import { ConfigService } from '@rxap/config';
import { AuthorizationService } from './authorization.service';

export function provideAuthorization() {
  return [
    AuthorizationService,
    {
      provide: RXAP_DISABLE_AUTHORIZATION,
      useFactory: (config: ConfigService) => config.get<boolean>('authorization.disabled'),
      deps: [ConfigService]
    }
  ]
}

export function setAuthorizationScope(scope: string) {
  return {
    provide: RXAP_AUTHORIZATION_SCOPE,
    useValue: scope
  }
}
