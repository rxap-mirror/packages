import { ComponentType } from '@angular/cdk/overlay';
import {
  CdkPortalOutlet,
  ComponentPortal,
  Portal,
  PortalModule,
} from '@angular/cdk/portal';

import {
  AfterViewInit,
  Component,
  ComponentRef,
  inject,
  Injector,
  INJECTOR,
  ViewContainerRef,
  ViewRef,
  input,
  viewChildren,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import {
  ReplaySubject,
  Subject,
  tap,
} from 'rxjs';

// TODO : refactor move to package @rxap/ngx-testing

export class MockWindowRef<O = any, R = any> extends Subject<R> {

  /**
   * @deprecated removed. use the subscribe method and wait for the resolve event
   */
  public readonly closed$ = new Subject<R | undefined>();

  /**
   * @internal
   */
  public footerPortal$ = new ReplaySubject<Portal<any>>(1);

  /**
   * @deprecated removed. use the complete method
   * @param result
   */
  public close(result?: R): void {
    this.closed$.next(result);
    if (result !== undefined) {
      this.next(result);
    }
    this.complete();
  }

  public override complete() {
    super.complete();
  }

  /**
   * @param portal
   */
  public setFooterPortal(portal: Portal<any>) {
    setTimeout(() => {
      this.footerPortal$.next(portal);
    });
  }

}

@Component({
    template: `
    <div class="flex flex-col gap-8">
      <div class="grow">
        <ng-template [cdkPortalOutlet]="content()"></ng-template>
      </div>
      <hr class="m-4">
      <div class="grow-0">
        <ng-template [cdkPortalOutlet]="footer()"></ng-template>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    PortalModule
]
})
export class WindowTestWrapperComponent implements AfterViewInit {

  readonly component = input.required<ComponentType<unknown>>();

  // signals: the portals are set after the view was initialized (ngAfterViewInit / timer) which
  // is only picked up by the change detection (without zone.js) when it is tracked by a signal
  readonly content = signal<Portal<unknown> | null>(null);
  readonly footer = signal<Portal<unknown> | null>(null);

  injector         = inject(INJECTOR);
  viewContainerRef = this.injector.get(ViewContainerRef);

  public readonly portalOutlet = viewChildren(CdkPortalOutlet);

  ngAfterViewInit() {
    this.portalOutlet().forEach((outlet) => {
      outlet.attached.pipe(
        tap(attachedRef => {
          if (attachedRef instanceof ComponentRef) {
            console.log('ComponentRef', attachedRef);
            // attachedRef.changeDetectorRef.detach();
          } else if (attachedRef instanceof ViewRef) {
            console.log('viewRef', attachedRef);
          } else {
            console.log('attachedRef', attachedRef);
          }
        }),
      ).subscribe();
    });
    const windowRef = new MockWindowRef();
    const injector  = Injector.create({
      parent: this.injector,
      providers: [ {
        provide: RXAP_WINDOW_REF,
        useValue: windowRef,
      } ],
    });
    windowRef.footerPortal$.pipe(
      tap((portal) => this.footer.set(portal)),
    ).subscribe();
    this.content.set(new ComponentPortal(this.component(), this.viewContainerRef, injector));
  }

}
