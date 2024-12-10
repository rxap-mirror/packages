import { inject, provideAppInitializer } from '@angular/core';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import {
  debounceTime,
  tap,
} from 'rxjs';

export function subscribeToLogoutEvent(pubSubService: PubSubService) {
  return () => {
    pubSubService.subscribe(RXAP_TOPICS.authentication.logout).pipe(
      // wait some time to ensure other logout handlers are executed
      debounceTime(64),
      tap(() => location.replace(location.origin + '/oauth2/sign_out'))
    ).subscribe();
  };
}

export function provideOauth2Proxy() {
  return provideAppInitializer(() => {
        const initializerFn = (subscribeToLogoutEvent)(inject(PubSubService));
        return initializerFn();
      });
}
