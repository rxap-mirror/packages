import { ComponentType } from '@angular/cdk/overlay';
import {
  CdkPortalOutlet,
  ComponentPortal,
  Portal,
  PortalModule,
} from '@angular/cdk/portal';
import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  inject,
  Injector,
  INJECTOR,
  Input,
  QueryList,
  ViewChildren,
  ViewContainerRef,
  ViewRef,
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
        <ng-template [cdkPortalOutlet]="content"></ng-template>
      </div>
      <hr class="m-4">
      <div class="grow-0">
        <ng-template [cdkPortalOutlet]="footer"></ng-template>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    PortalModule,
    NgIf,
  ],
})
export class WindowTestWrapperComponent implements AfterViewInit {

  @Input({required: true})
  component!: ComponentType<unknown>;

  content: Portal<unknown> | null = null;
  footer: Portal<unknown> | null = null;

  injector         = inject(INJECTOR);
  viewContainerRef = this.injector.get(ViewContainerRef);

  @ViewChildren(CdkPortalOutlet)
  public portalOutlet!: QueryList<CdkPortalOutlet>;

  ngAfterViewInit() {
    this.portalOutlet.forEach((outlet) => {
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
      tap((portal) => this.footer = portal),
    ).subscribe();
    this.content = new ComponentPortal(this.component, this.viewContainerRef, injector);
  }

}
