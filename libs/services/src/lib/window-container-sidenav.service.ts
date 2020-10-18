import {
  Injectable,
  ViewContainerRef,
  Injector,
  ComponentFactoryResolver
} from '@angular/core';
import { Subject } from 'rxjs';
import { Constructor } from '@rxap/utilities';

export interface ContainerComponent {
  id: string;
  component: Constructor;
  viewContainerRef?: ViewContainerRef | null;
  injector?: Injector | null;
  componentFactoryResolver?: ComponentFactoryResolver | null;
}

@Injectable({ providedIn: 'root' })
export class WindowContainerSidenavService {

  private components = new Map<string, ContainerComponent>();

  public add$    = new Subject<ContainerComponent>();
  public remove$ = new Subject<ContainerComponent>();

  public add(component: ContainerComponent): void {
    if (this.components.has(component.id)) {
      this.remove$.next(component);
    }
    this.components.set(component.id, component);
    this.add$.next(component);
  }

  public remove(componentOrId: ContainerComponent | string): void {
    const id = typeof componentOrId === 'string' ? componentOrId : componentOrId.id;
    if (this.components.has(id)) {
      this.remove$.next(this.components.get(id)!);
      this.components.delete(id);
    }
  }

  public getAll(): ContainerComponent[] {
    return Array.from(this.components.values());
  }


}
