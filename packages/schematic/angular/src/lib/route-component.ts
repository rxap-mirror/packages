import { Normalized } from '@rxap/utilities';
import {
  ComponentOptions,
  NormalizeComponentOptions,
  NormalizedComponentOptions,
} from './component-options';

export interface RouteComponent extends ComponentOptions {
  selector?: false;
  path?: string;
  children?: RouteComponent[];
  data?: Record<string, any>;
  outlet?: string;
}

export interface NormalizedRouteComponent extends Readonly<Normalized<Omit<RouteComponent, keyof ComponentOptions | 'children'>> & NormalizedComponentOptions> {
  selector: false;
  path: string;
  children: Array<NormalizedRouteComponent> | null;
}

export function NormalizeRouteComponent(options: RouteComponent): NormalizedRouteComponent {
  const normalized = NormalizeComponentOptions({
    ...options,
    selector: false,
  });
  return {
    ...normalized,
    selector: false,
    path: options.path ?? normalized.name,
    children: NormalizeRouteComponentList(options.children),
    outlet: options.outlet ?? null,
    data: options.data && Object.keys(options.data).length ? Object.freeze(options.data) : null,
  };
}

export function NormalizeRouteComponentList(options?: RouteComponent[]): NormalizedRouteComponent[] | null {
  return options ? options.map(NormalizeRouteComponent) : null;
}
