import {
  Injectable,
  Injector,
  ComponentFactoryResolver
} from '@angular/core';
import {
  WindowConfig,
  DEFAULT_WINDOW_CONFIG
} from './window-config';
import {
  OverlayConfig,
  Overlay
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { WindowRef } from './window-ref';
import {
  RXAP_WINDOW_CONTEXT,
  RXAP_WINDOW_CONTAINER_CONTEXT
} from './tokens';
import {
  WindowContext,
  WindowContainerContext
} from './window-context';
import {
  first,
  tap
} from 'rxjs/operators';
import { v1 as uuid } from 'uuid';
import { DefaultWindowComponent } from './default-window/default-window.component';

@Injectable()
export class WindowService {

  public active = new Map<string, WindowRef<any>>();

  constructor(
    private injector: Injector,
    private overlay: Overlay,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public get<D>(id: string): WindowRef<D> {
    if (!this.active.has(id)) {
      throw new Error(`Active Window with id '${id}' not found`);
    }
    // tslint:disable-next-line:no-non-null-assertion
    return this.active.get(id)!;
  }

  public close(id: string): boolean {
    const windowRef = this.get(id);
    windowRef.close();
    return this.active.delete(id);
  }

  public has(id: string): boolean {
    return this.active.has(id);
  }

  public open<D, T>(config: WindowConfig<D, T>): WindowRef<D> {

    // Override default configuration
    const windowConfig = { id: uuid(), ...DEFAULT_WINDOW_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(windowConfig);

    // Instantiate remote control
    const windowRef = new WindowRef<D>(overlayRef, this.overlay, windowConfig);

    const context: WindowContext<any> = {
      id:   windowConfig.id,
      overlayRef,
      windowRef,
      data: windowConfig.data
    };

    const containerContext: WindowContainerContext<any> = {
      template:  windowConfig.template,
      component: windowConfig.component
    };

    const injector = Injector.create({
      parent:    windowConfig.injector || this.injector,
      providers: [
        {
          provide:  RXAP_WINDOW_CONTAINER_CONTEXT,
          useValue: containerContext
        },
        {
          provide:  RXAP_WINDOW_CONTEXT,
          useValue: context
        }
      ]
    });

    const containerPortal = new ComponentPortal(
      DefaultWindowComponent,
      null,
      injector,
      this.componentFactoryResolver
    );

    overlayRef.attach(containerPortal);

    overlayRef.backdropClick().pipe(
      first(),
      tap(() => windowRef.close())
    ).subscribe();

    this.active.set(windowConfig.id, windowRef);

    return windowRef;
  }

  private createOverlay({ panelClass, width, height }: OverlayConfig) {
    const positionStrategy = this.overlay
                                 .position()
                                 .global().top('0px').left('0px');

    const overlayConfig = new OverlayConfig({
      hasBackdrop:    false,
      panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      width,
      height,
      maxWidth:       '100vw',
      maxHeight:      '100vh',
      positionStrategy
    });

    return this.overlay.create(overlayConfig);
  }

}
