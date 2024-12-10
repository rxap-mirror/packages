import { inject, Injectable, Provider, provideAppInitializer } from '@angular/core';
import markerSDK, {
  MarkerReporter,
  MarkerSdk
} from '@marker.io/browser';
import { ConfigService } from '@rxap/config';
import {
  Environment,
  RXAP_ENVIRONMENT
} from '@rxap/environment';
import {
  PubSubService,
  RXAP_TOPICS
} from '@rxap/ngx-pub-sub';
import { DeleteProperties } from '@rxap/utilities';
import { tap } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class MarkerIoService {

  private readonly environment = inject<Environment>(RXAP_ENVIRONMENT);

  private readonly config = inject(ConfigService);

  private readonly pubSub = inject(PubSubService);

  private widget: MarkerSdk | null = null;

  async load() {
    const config = this.config.get('marker');
    if (!config) {
      console.warn('No marker.io configuration found');
      return;
    }
    if (typeof config !== 'object') {
      console.error('The marker.io configuration is not an object');
      return;
    }
    if (config.disabled) {
      console.warn('The marker.io widget is disabled');
      return;
    }
    if (!config.project) {
      console.error('The marker.io configuration object does not contain a project key');
      return;
    }
    console.log('Load marker.io widget');
    try {
      this.widget = await markerSDK.loadWidget(config);
      const customData = DeleteProperties(
        this.environment, [ 'moduleFederation', 'sentry', 'config', 'openApi', 'slug' ]);
      console.debug('Set custom marker.io data', customData);
      this.widget.setCustomData(customData);
    } catch (e) {
      console.error('Failed to load marker.io widget', e);
    }
    this.pubSub.subscribe(RXAP_TOPICS.authentication.logout).pipe(
      tap(() => this.clearReporter())
    ).subscribe();
  }

  setReporter(reporter: MarkerReporter) {
    this.widget?.setReporter(reporter);
  }

  clearReporter() {
    this.widget?.setReporter({
      email: '',
      fullName: ''
    });
  }
}

export function provideMarkerIo() {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((service: MarkerIoService) => () => service.load())(inject(MarkerIoService));
        return initializerFn();
      })
  ];
}
