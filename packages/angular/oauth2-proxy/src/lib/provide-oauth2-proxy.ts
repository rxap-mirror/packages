import { APP_INITIALIZER } from '@angular/core';
import { PubSubService } from '@rxap/ngx-pub-sub';

export function subscribeToLogoutEvent(pubSubService: PubSubService) {
  return () => {
    pubSubService.subscribe('authentication.logout').subscribe(() => {
      location.replace(location.origin + '/oauth2/sign_out');
    });
  };
}

export function provideOauth2Proxy() {
  return {
    provide: APP_INITIALIZER,
    useFactory: subscribeToLogoutEvent,
    deps: [ PubSubService ],
    multi: true,
  };
}
