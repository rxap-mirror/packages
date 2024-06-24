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
import { RXAP_FOOTER_COMPONENT } from './tokens';
import { coerceArray } from '@rxap/utilities';

@Injectable()
export class FooterService {

  private readonly components = coerceArray(inject(RXAP_FOOTER_COMPONENT, { optional: true }));

  /**
   * Represents an array of `Portal` objects with unknown type.
   */
  public readonly portals = signal<Array<Portal<unknown>>>(this.components.map(component => new ComponentPortal(component)));


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
    if (!this.portals().includes(portal)) {
      this.portals.update(portals => [ ...portals, portal ]);
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
    const index = this.portals().indexOf(portal);
    if (index !== -1) {
      this.portals.update(portals => {
        portals.splice(index, 1);
        return portals.slice();
      });
    }
  }

}
