import {
  Overlay,
  OverlayRef,
  OverlaySizeConfig,
} from '@angular/cdk/overlay';
import { Portal } from '@angular/cdk/portal';
import {
  ComponentRef,
  EmbeddedViewRef,
  InjectFlags,
} from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { RXAP_WINDOW_SETTINGS } from './tokens';
import { GetWindowStartPos } from './utilities';
import { WindowSettings } from './window-config';

export class WindowRef<D = any, R = any> extends Subject<R> {

  public readonly width$ = new BehaviorSubject<string>(this.getWidth());
  public readonly height$ = new BehaviorSubject<string>(this.getHeight());

  /**
   * @deprecated removed. use the subscribe method and wait for the resolve event
   */
  public readonly closed$ = new Subject<R | undefined>();

  public attachedRef$ = new ReplaySubject<ComponentRef<any> | EmbeddedViewRef<any>>(1);
  /**
   * @internal
   */
  public footerPortal$ = new ReplaySubject<Portal<any>>(1);
  /**
   * @internal
   */
  public titlePortal$ = new ReplaySubject<Portal<any>>(1);
  public settings$ = new ReplaySubject<WindowSettings>(1);
  /**
   * stores the window size before fullScreen
   * @internal
   */
  private oldSizes: { width: string, height: string, pos: { x: string, y: string } } | null = null;

  constructor(
    public readonly overlayRef: OverlayRef,
    private readonly overlay: Overlay,
    public settings: WindowSettings<D>,
  ) {
    super();
  }

  public get isMinimized(): boolean {
    return this.overlayRef.hostElement.style.display === 'none';
  }

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
    this.overlayRef.dispose();
    super.complete();
  }

  public minimize(): void {
    this.overlayRef.hostElement.style.display = 'none';
  }

  public reopen(): void {
    const startPos = GetWindowStartPos();
    this.setPos(startPos.left, startPos.top);
    this.overlayRef.hostElement.style.display = 'flex';
  }

  public getSizeConfig(): OverlaySizeConfig {
    const config = this.overlayRef.getConfig();
    return {
      width: config.width,
      height: config.height,
      minHeight: config.minHeight,
      minWidth: config.minWidth,
      maxHeight: config.maxHeight,
      maxWidth: config.maxWidth,
    };
  }

  public setWidth(width: string): void {
    this.overlayRef.updateSize({
      ...this.getSizeConfig(),
      width,
    });
    this.width$.next(width);
  }

  public setHeight(height: string): void {
    this.overlayRef.updateSize({
      ...this.getSizeConfig(),
      height,
    });
    this.height$.next(height);
  }

  public getWidth(): string {
    return this.getSizeConfig().width! + '';
    // return this.overlayRef.overlayElement.offsetWidth + 'px'
  }

  public getHeight(): string {
    return this.getSizeConfig().height! + '';
    // return this.overlayRef.overlayElement.offsetHeight + 'px';
  }

  public setPos(x: string, y: string): void {
    this.overlayRef.updatePositionStrategy(this
      .overlay
      .position()
      .global()
      .top(y)
      .left(x),
    );
    this.overlayRef.updatePosition();
  }

  public getPos(): { x: string, y: string } {
    const pos = this.overlayRef.overlayElement.getBoundingClientRect();
    return {
      x: pos.left + 'px',
      y: pos.top + 'px',
    };
  }

  public fullScreen(): void {
    if (this.oldSizes === null) {
      this.oldSizes = {
        width: this.overlayRef.overlayElement.offsetWidth + 'px',
        height: this.overlayRef.overlayElement.offsetHeight + 'px',
        pos: this.getPos(),
      };
      this.setWidth('100vw');
      this.setHeight('100vh');
      this.setPos('0px', '0px');
    } else {
      this.setWidth(this.oldSizes.width);
      this.setHeight(this.oldSizes.height);
      this.setPos(this.oldSizes.pos.x, this.oldSizes.pos.y);
      this.oldSizes = null;
    }
  }

  /**
   * @param portal
   */
  public setFooterPortal(portal: Portal<any>) {
    setTimeout(() => {
      this.footerPortal$.next(portal);
    });
  }

  public setTitlePortal(portal: Portal<any>) {
    setTimeout(() => {
      this.titlePortal$.next(portal);
    });
  }

  public setAttachedRef(attachedRef: ComponentRef<any> | EmbeddedViewRef<any>) {
    if (attachedRef instanceof ComponentRef) {
      this.updateWindowSettings(attachedRef);
    } else {
      this.updateWindowSettings();
    }
    this.attachedRef$.next(attachedRef);
  }


  /**
   * Injects the window settings from the component ref injector and overwrites
   * the settings
   * @private
   */
  private updateWindowSettings(componentRef?: ComponentRef<any>) {
    const settings = componentRef?.injector.get(RXAP_WINDOW_SETTINGS, null, InjectFlags.Optional) ?? this.settings;
    if (settings) {
      // prevent change diction error: ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.settings$.next(Object.assign({}, this.settings, settings));
      });
    }
  }

}
