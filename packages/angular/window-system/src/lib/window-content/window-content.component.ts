import { afterNextRender, ChangeDetectionStrategy, Component, ComponentRef, Injector, isDevMode, ViewContainerRef, viewChild, inject } from '@angular/core';
import {
  RXAP_WINDOW_CONTAINER_CONTEXT,
  RXAP_WINDOW_REF,
} from '../tokens';
import { WindowContainerContext } from '../window-context';
import {
  CdkPortalOutlet,
  ComponentPortal,
  Portal,
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import type { WindowRef } from '../window-ref';
import {
  catchError,
  delay,
  filter,
  startWith,
  take,
  tap,
  timeout,
} from 'rxjs/operators';
import {
  isObservable,
  throwError,
  TimeoutError,
} from 'rxjs';
import { LoadingIndicatorService } from '@rxap/services';
import { isDefined } from '@rxap/rxjs';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Window Content',
  category: 'Window System',
  description: 'Renders the component or template of the window configuration inside a portal and registers it at the window ref. The component is read from the window container context, which the styleguide host provides with a demo component.',
  status: 'stable',
  variants: [
    { name: 'Component' },
  ],
})
@Component({
    selector: 'rxap-window-content',
    templateUrl: './window-content.component.html',
    styleUrls: ['./window-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PortalModule]
})
export class WindowContentComponent  {
  private readonly windowRef = inject<WindowRef>(RXAP_WINDOW_REF);
  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);


  public context: WindowContainerContext<any>;

  public portal: Portal<any> | null = null;

  public readonly portalOutlet = viewChild.required(CdkPortalOutlet);

  constructor() {
    const context = inject(RXAP_WINDOW_CONTAINER_CONTEXT);

    this.context = context;

    if (this.context.template) {
      this.portal = new TemplatePortal(this.context.template, this.viewContainerRef);
    } else if (this.context.component) {
      this.portal = new ComponentPortal<any>(this.context.component, this.viewContainerRef, this.injector);
    }

    afterNextRender(() => this.attach());
  }

  private attach() {
    this.portalOutlet().attached.pipe(
      startWith(this.portalOutlet().attachedRef),
      isDefined(),
      take(1),
      tap(attachedRef => this.windowRef.setAttachedRef(attachedRef)),
      tap(attachedRef => {
        const promise: Promise<any>[] = [];
        if (attachedRef instanceof ComponentRef) {
          attachedRef.changeDetectorRef.detectChanges();
          const loading$ = attachedRef.instance.loading$;
          if (loading$ && isObservable(loading$)) {
            if (isDevMode()) {
              console.warn('The component has a loading indicator member');
            }
            this.loadingIndicatorService.attachLoading(loading$);
            promise.push(loading$.pipe(
              filter(Boolean),
              take(1),
              delay(100),
              tap(() => attachedRef.changeDetectorRef.detectChanges()),
            ).toPromise());
          } else {
            this.loadingIndicatorService.disable();
          }
        } else {
          this.loadingIndicatorService.disable();
        }
        return Promise.all(promise);
      }),
      timeout(10000),
      catchError(error => {

        if (error instanceof TimeoutError) {
          if (isDevMode()) {
            console.warn('The window content never resolved the attached ref');
          }
        }

        return throwError(error);
      }),
    ).subscribe();
  }

}
