import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedRouteComponent,
  NormalizeRouteComponent,
  RouteComponent,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { RouteComponentOptions } from './schema';

export type NormalizedRouteComponentOptions = Readonly<Normalized<Omit<RouteComponentOptions, keyof RouteComponent | keyof AngularOptions>> & NormalizedAngularOptions & NormalizedRouteComponent>;

export function NormalizeRouteComponentOptions(options: RouteComponentOptions): NormalizedRouteComponentOptions {
  return {
    ...NormalizeAngularOptions(options),
    ...NormalizeRouteComponent(options),
  };
}