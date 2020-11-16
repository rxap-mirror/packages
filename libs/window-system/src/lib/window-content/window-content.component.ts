import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  Injector,
  ViewContainerRef,
  ViewChild,
  AfterViewInit
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

@Component({
  selector:        'rxap-window-content',
  templateUrl:     './window-content.component.html',
  styleUrls:       [ './window-content.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    const attachedRef = this.portalOutlet.attachedRef;
    if (!attachedRef) {
      throw new Error('The portal outlet has not an attached ref after the view is init');
    }
    this.windowRef.setAttachedRef(attachedRef);
  }

}
