import {
  OverlayRef,
  ComponentType
} from '@angular/cdk/overlay';
import { WindowRef } from './window-ref';
import { TemplateRef } from '@angular/core';

export interface WindowContext<D> {
  overlayRef: OverlayRef;
  windowRef: WindowRef<D>;
  data?: D;
  id: string;
}

export interface WindowContainerContext<T> {
  component?: ComponentType<T>;
  template?: TemplateRef<T>;
}
