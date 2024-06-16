import { Normalized } from '@rxap/utilities';
import { MethodKinds } from './method-kinds';

export interface BaseMethodOptions {
  kind: MethodKinds;
}

export type NormalizedBaseMethodOptions = Readonly<Normalized<BaseMethodOptions>>;

export function NormalizeBaseMethodOptions(method: BaseMethodOptions): NormalizedBaseMethodOptions {
  return Object.seal({
    kind: method.kind ?? MethodKinds.DEFAULT,
  });
}
