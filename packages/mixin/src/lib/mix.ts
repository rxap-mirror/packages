import { getMixables } from './get-mixables';
import 'reflect-metadata';
import {
  Constructor,
  Mixin,
} from './utilities';

/**
 * @summary
 * Applies mixins to a class by copying their properties and methods to the target class prototype.
 *
 * @param client - The target class constructor to which the mixins will be applied
 * @param mixins - An array of mixins to be applied. Each mixin can be either a class constructor or an object
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   hello() { return 'Hello'; }
 * }
 *
 * @mix(MyMixin)
 * class MyClass {}
 *
 * const instance = new MyClass();
 * instance.hello(); // returns 'Hello'
 * ```
 *
 * @example
 * ```typescript
 * const objectMixin = {
 *   greet() { return 'Hi'; }
 * };
 *
 * mix(MyClass, [objectMixin]);
 * const instance = new MyClass();
 * instance.greet(); // returns 'Hi'
 * ```
 *
 * @throws Will throw an error if a mixin is neither a class constructor nor an object
 */
export function mix(client: Constructor<any>, mixins: Array<Mixin<any>>) {
  mixins.forEach(mixin => Object.defineProperties(client.prototype, getMixables(client, mixin)));
}
