import {
  ComponentPortal,
  Portal,
} from '@angular/cdk/portal';
import {
  computed,
  inject,
  Injectable,
  isDevMode,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { RXAP_DEFAULT_HEADER_ITEM_COMPONENT } from '../tokens';
import {
  coerceArray,
  IsFunction,
} from '@rxap/utilities';

@Injectable()
export class DefaultHeaderService {

  private readonly components = toSignal(from(Promise.all(coerceArray(inject(RXAP_DEFAULT_HEADER_ITEM_COMPONENT, { optional: true }))
    .map(item => IsFunction(item) ? item() : item))), { initialValue: [] });

  private readonly injectedPortals = computed(() => this.components().map(component => new ComponentPortal(component)));
  private readonly methodPortals = signal<Portal<unknown>[]>([]);

  /**
   * Represents an array of `Portal` objects with unknown type.
   *
   * @typedef {Array<Portal<unknown>>} SignalPortals
   */
  public readonly portals = computed(() => [ ...this.injectedPortals(), ...this.methodPortals() ]);


  /**
   * Computes the count of portals.
   *
   * @returns {number} The count of portals.
   */
  public readonly portalCount = computed(() => this.portals().length);


  /**
   * Adds a portal to the list of portals.
   *
   * @param {Portal<unknown>} portal - The portal to be added.
   *
   * @return {void}
   */
  public pushPortal(portal: Portal<unknown>) {
    if (!this.methodPortals().includes(portal)) {
      this.methodPortals.update(portals => [ ...portals, portal ]);
    } else {
      if (isDevMode()) {
        console.warn('Can not add the same portal multiple times');
      }
    }
  }

  /**
   * Removes a portal from the list of portals.
   *
   * @param {Portal<unknown>} portal - The portal to be removed.
   * @return {void}
   */
  public removePortal(portal: Portal<unknown>) {
    const index = this.methodPortals().indexOf(portal);
    if (index !== -1) {
      this.methodPortals.update(portals => {
        portals.splice(index, 1);
        return portals.slice();
      });
    }
  }

}
