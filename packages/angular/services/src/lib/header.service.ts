import {
  computed,
  Injectable,
  signal,
} from '@angular/core';
import { Constructor } from '@rxap/utilities';

export interface SortedComponent {
  component: Constructor;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class HeaderService {

  private readonly componentsWithMetadata = signal<Array<SortedComponent>>([]);
  public readonly componentCount = computed(() => this.componentsWithMetadata().length + 1);
  public readonly components = computed(() => this.componentsWithMetadata().map(item => item.component));

  public addComponent(component: Constructor, order = 0): void {
    this.componentsWithMetadata.mutate(components => {
      components.push({
        component,
        order,
      });
      components.sort((a, b) => a.order - b.order);
    });
  }

}
