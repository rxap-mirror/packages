import { Portal } from '@angular/cdk/portal';
import {
  computed,
  Injectable,
  isDevMode,
  signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FooterService {

  /**
   * Represents an array of `Portal` objects with unknown type.
   *
   * @typedef {Array<Portal<unknown>>} SignalPortals
   */
  public readonly portals = signal<Array<Portal<unknown>>>([]);


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
