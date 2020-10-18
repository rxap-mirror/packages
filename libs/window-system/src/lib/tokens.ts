import { InjectionToken } from '@angular/core';
import type {
  WindowContext,
  WindowContainerContext
} from './window-context';
import type { WindowRef } from './window-ref';

export const RXAP_WINDOW_CONTEXT           = new InjectionToken<WindowContext<any>>('rxap/core/window/WINDOW_CONTEXT');
export const RXAP_WINDOW_CONTAINER_CONTEXT = new InjectionToken<WindowContainerContext<any>>('rxap/core/window/WINDOW_CONTAINER_CONTEXT');
export const RXAP_WINDOW_REF = new InjectionToken<WindowRef>('rxap/window-system/WINDOW_REF');
