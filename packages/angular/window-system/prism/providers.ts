import { Provider } from '@angular/core';
import { LoadingIndicatorService } from '@rxap/services';
import {
  RXAP_WINDOW_CONTAINER_CONTEXT,
  RXAP_WINDOW_CONTEXT,
  RXAP_WINDOW_REF,
} from '../src/lib/tokens';
import { WindowContainerContext, WindowContext } from '../src/lib/window-context';
import { WindowService } from '../src/lib/window.service';
import {
  createDemoWindowRef,
  DemoWindowService,
  WINDOW_DEMO_SETTINGS,
  WindowDemoContentComponent,
} from './window-demo';

const { windowRef, overlayRef } = createDemoWindowRef(WINDOW_DEMO_SETTINGS);

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * The window components are normally created by the WindowService inside a cdk overlay. The styleguide renders
 * them in its canvas, with a demo window ref, window context and content.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    // the loading indicator starts in the loading state and is disabled by the window content
    provide: LoadingIndicatorService,
    useFactory: () => {
      const service = new LoadingIndicatorService();
      service.disable();
      return service;
    },
  },
  { provide: WindowService, useClass: DemoWindowService },
  { provide: RXAP_WINDOW_REF, useValue: windowRef },
  {
    provide: RXAP_WINDOW_CONTEXT,
    useValue: { id: 'prism-window', overlayRef, windowRef } satisfies WindowContext<unknown>,
  },
  {
    provide: RXAP_WINDOW_CONTAINER_CONTEXT,
    useValue: { component: WindowDemoContentComponent } satisfies WindowContainerContext<unknown>,
  },
];
