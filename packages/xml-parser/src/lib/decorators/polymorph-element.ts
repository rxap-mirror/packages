import { ParsedElement } from '../elements/parsed-element';

export type PolymorphElement<Base extends ParsedElement, Mixins extends any[]> = Base & {
  [K in keyof Mixins[number]]: Mixins[number][K];
};
