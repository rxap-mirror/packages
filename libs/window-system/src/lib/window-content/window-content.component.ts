import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  Injector,
  ViewContainerRef,
  ViewChild,
  AfterViewInit,
  ComponentRef,
  isDevMode
} from '@angular/core';
import {
  RXAP_WINDOW_CONTAINER_CONTEXT,
  RXAP_WINDOW_REF
} from '../tokens';
import { WindowContainerContext } from '../window-context';
import {
  ComponentPortal,
  Portal,
  TemplatePortal,
  CdkPortalOutlet
} from '@angular/cdk/portal';
import type { WindowRef } from '../window-ref';
import {
  startWith,
  take,
  tap,
  timeout,
  catchError
} from 'rxjs/operators';
import { isDefined } from '@rxap/utilities';
import {
  TimeoutError,
  throwError
} from 'rxjs';

@Component({
  selector:        'rxap-window-content',
  templateUrl:     './window-content.component.html',
  styleUrls:       [ './window-content.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WindowContentComponent implements AfterViewInit {

  public context: WindowContainerContext<any>;

  public portal: Portal<any> | null = null;

  @ViewChild(CdkPortalOutlet)
  public portalOutlet!: CdkPortalOutlet;

  constructor(
    @Inject(RXAP_WINDOW_CONTAINER_CONTEXT)
      context: any,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef,
    private readonly  injector: Injector,
    private readonly  viewContainerRef: ViewContainerRef
  ) {
    this.context = context;
    if (this.context.template) {
      this.portal = new TemplatePortal(this.context.template, this.viewContainerRef);
    } else if (this.context.component) {
      this.portal = new ComponentPortal<any>(this.context.component, this.viewContainerRef, this.injector);
    }
  }

  public ngAfterViewInit() {
    this.portalOutlet.attached.pipe(
      startWith(this.portalOutlet.attachedRef),
      isDefined(),
      take(1),
      tap(attachedRef => {
        if (attachedRef instanceof ComponentRef) {
          attachedRef.changeDetectorRef.detectChanges();
        }
        this.windowRef.setAttachedRef(attachedRef);
      }),
      timeout(10000),
      catchError(error => {

        if (error instanceof TimeoutError) {
          if (isDevMode()) {
            console.warn('The window content never resolved the attached ref');
          }
        }

        return throwError(error);
      })
    ).subscribe();
  }

}
