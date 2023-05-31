import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy
} from '@angular/core';
import {
  WindowContainerSidenavService,
  ContainerComponent
} from '@rxap/services';
import {
  ComponentPortal,
  PortalModule
} from '@angular/cdk/portal';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NgFor } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector:        'rxap-window-container-sidenav',
  templateUrl:     './window-container-sidenav.component.html',
  styleUrls:       [ './window-container-sidenav.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ FlexModule, NgFor, PortalModule ]
})
export class WindowContainerSidenavComponent implements OnInit, OnDestroy {

  public portals = new Map<string, ComponentPortal<any>>();

  private subscription = new Subscription();

  constructor(
    @Inject(WindowContainerSidenavService)
    public readonly service: WindowContainerSidenavService
  ) { }

  public ngOnInit(): void {
    const components = this.service.getAll();
    for (const component of components) {
      this.add(component);
    }
    this.subscription.add(this.service.add$.pipe(
      tap(component => this.add(component))
    ).subscribe());
    this.subscription.add(this.service.remove$.pipe(
      tap(component => this.remove(component))
    ).subscribe());
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public trackBy(index: number, id: string) {
    return id;
  }

  private add(component: ContainerComponent) {
    if (this.portals.has(component.id)) {
      throw new Error(`Component portal with id ${component.id} already exists`);
    }
    const portal = new ComponentPortal(component.component, component.viewContainerRef, component.injector, component.componentFactoryResolver);
    this.portals.set(component.id, portal);
  }

  private remove(component: ContainerComponent) {
    if (this.portals.has(component.id)) {
      const portal = this.portals.get(component.id)!;
      this.portals.delete(component.id);
      portal.detach();
    }
  }

}
