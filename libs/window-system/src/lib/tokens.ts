import { InjectionToken } from '@angular/core';
import {
  WindowContext,
  WindowContainerContext
} from './window-context';

export const RXAP_WINDOW_CONTEXT           = new InjectionToken<WindowContext<any>>('rxap/core/window/WINDOW_CONTEXT');
export const RXAP_WINDOW_CONTAINER_CONTEXT = new InjectionToken<WindowContainerContext<any>>('rxap/core/window/WINDOW_CONTAINER_CONTEXT');
