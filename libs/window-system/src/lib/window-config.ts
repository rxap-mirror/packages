import { ComponentType } from '@angular/cdk/portal';
import {
  Injector,
  ComponentFactoryResolver,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  ButtonDefinition,
  IconConfig
} from '@rxap/utilities';

export interface WindowActions<A> {
  position?: 'start' | 'end';
  definitions: ButtonDefinition<[ A ]>[];
}

export interface WindowSettings<D = any> {
  id?: string;
  title?: string;
  icon?: IconConfig;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  resizeable?: boolean;
  draggable?: boolean;
  panelClass?: string;
  data?: D;
  actions?: WindowActions<D>;
}

export interface WindowConfig<D = any, T = any> extends WindowSettings<D> {
  component?: ComponentType<T>;
  template?: TemplateRef<T>;
  injector?: Injector | null;
  injectorName?: string;
  componentFactoryResolver?: ComponentFactoryResolver | null;
  viewContainerRef?: ViewContainerRef | null;
}

export const DEFAULT_WINDOW_CONFIG: WindowConfig<any, any> = {
  resizeable:               true,
  draggable:                true,
  injector:                 null,
  componentFactoryResolver: null,
  minWidth:                 '384px',
  minHeight:                '192px',
  maxWidth:                 '100vw',
  maxHeight:                '100vw'
};
