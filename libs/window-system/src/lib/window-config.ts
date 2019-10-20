import { ComponentType } from '@angular/cdk/portal';
import {
  Injector,
  ComponentFactoryResolver,
  TemplateRef
} from '@angular/core';
import { v1 as uuid } from 'uuid';

export interface WindowSettings<D> {
  id?: string;
  title?: string;
  icon?: string;
  width?: string;
  height?: string;
  resizeable?: boolean;
  draggable?: boolean;
  panelClass?: string;
  data?: D;
}

export interface WindowConfig<D, T> extends WindowSettings<D> {
  component?: ComponentType<T>;
  template?: TemplateRef<T>;
  injector?: Injector | null;
  componentFactoryResolver?: ComponentFactoryResolver | null;
}

export const DEFAULT_WINDOW_CONFIG: WindowConfig<any, any> = {
  id:                       uuid(),
  resizeable:               true,
  draggable:                true,
  injector:                 null,
  componentFactoryResolver: null
};
