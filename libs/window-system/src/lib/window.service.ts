import {
  Injectable,
  Injector,
  ComponentFactoryResolver,
  Inject,
  ViewContainerRef,
  InjectFlags
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
  RXAP_WINDOW_CONTAINER_CONTEXT,
  RXAP_WINDOW_REF
} from './tokens';
import {
  WindowContext,
  WindowContainerContext
} from './window-context';
import {
  tap,
  take
} from 'rxjs/operators';
import { DefaultWindowComponent } from './default-window/default-window.component';
import { uuid } from '@rxap/utilities';
import { GetWindowStartPos } from './utilities';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WindowService {

  public get hasActiveWindows(): boolean {
    return this.active.size !== 0;
  }

  public get activeWindowCount(): number {
    return this.active.size;
  }

  public get allActiveWindows(): Array<WindowRef<any>> {
    return Array.from(this.active.values());
  }

  public readonly activeCount$ = new Subject<number>();
  private readonly active      = new Map<string, WindowRef<any>>();

  constructor(
    @Inject(Injector) private readonly injector: Injector,
    @Inject(Overlay) private readonly overlay: Overlay,
    @Inject(ComponentFactoryResolver) private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public get<D>(id: string): WindowRef<D> {
    if (!this.has(id)) {
      throw new Error(`Active Window with id '${id}' not found`);
    }
    // tslint:disable-next-line:no-non-null-assertion
    return this.active.get(id)!;
  }

  public close(id: string): boolean {
    const windowRef = this.get(id);
    windowRef.close();
    return this.remove(id);
  }

  public has(id: string): boolean {
    return this.active.has(id);
  }

  public open<D, T>(config: WindowConfig<D, T>): WindowRef<D> {

    // Override default configuration
    const windowConfig = { id: uuid(), ...DEFAULT_WINDOW_CONFIG, ...config };

    if (this.has(windowConfig.id)) {
      return this.get(windowConfig.id);
    }

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
      parent:    windowConfig.injector ?? this.injector,
      providers: [
        {
          provide:  RXAP_WINDOW_CONTAINER_CONTEXT,
          useValue: containerContext
        },
        {
          provide:  RXAP_WINDOW_CONTEXT,
          useValue: context
        },
        {
          provide:  RXAP_WINDOW_REF,
          useValue: windowRef
        }
      ],
      name:      windowConfig?.injectorName ?? 'WindowService'
    });

    const containerPortal = new ComponentPortal(
      DefaultWindowComponent,
      injector.get(ViewContainerRef, null, InjectFlags.Optional) ?? windowConfig.viewContainerRef ?? null,
      injector,
      injector.get(ComponentFactoryResolver, null, InjectFlags.Optional) ?? windowConfig.componentFactoryResolver ?? this.componentFactoryResolver
    );

    overlayRef.attach(containerPortal);

    overlayRef.backdropClick().pipe(
      take(1),
      tap(() => windowRef.close())
    ).subscribe();

    windowRef.closed$.pipe(
      take(1),
      tap(() => this.remove(windowConfig.id))
    ).subscribe();

    this.add(windowRef);

    return windowRef;
  }

  public remove(id: string) {
    const result = this.active.delete(id);
    this.activeCount$.next(this.active.size);
    return result;
  }

  public add(windowRef: WindowRef<any>): void {
    this.active.set(windowRef.settings.id!, windowRef);
    this.activeCount$.next(this.active.size);
  }

  private createOverlay({ panelClass, width, height }: OverlayConfig) {

    const startPos = GetWindowStartPos();

    const positionStrategy = this.overlay
                                 .position()
                                 .global().top(startPos.top).left(startPos.left);

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
