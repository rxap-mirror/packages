import { getMixables } from './get-mixables';
import 'reflect-metadata';
import {
  Mixin,
  Constructor
} from './utilities';

export function mix(client: Constructor<any>, mixins: Array<Mixin<any>>) {
  mixins.forEach(mixin => Object.defineProperties(client.prototype, getMixables(client, mixin)));
}
