import { Portal } from '@angular/cdk/portal';
import {
  computed,
  Injectable,
  isDevMode,
  signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FooterService {

  public readonly portals = signal<Array<Portal<unknown>>>([]);
  public readonly portalCount = computed(() => this.portals().length);

  public pushPortal(portal: Portal<unknown>) {
    if (!this.portals().includes(portal)) {
      this.portals.update(portals => [ ...portals, portal ]);
    } else {
      if (isDevMode()) {
        console.warn('Can not add the same portal multiple times');
      }
    }
  }

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
