import {
  OverlayRef,
  OverlaySizeConfig,
  Overlay
} from '@angular/cdk/overlay';
import { WindowSettings } from './window-config';
import { BehaviorSubject } from 'rxjs';

export class WindowRef<D> {

  public width$  = new BehaviorSubject<string>(this.getWidth());
  public height$ = new BehaviorSubject<string>(this.getHeight());

  constructor(
    public readonly overlayRef: OverlayRef,
    private readonly overlay: Overlay,
    public readonly settings: WindowSettings<D>
  ) {}

  public close(): void {
    this.overlayRef.detach();
  }

  public minimize(): void {
    this.overlayRef.hostElement.style.display = 'none';
  }

  public reopen(): void {
    this.overlayRef.hostElement.style.display = 'flex';
  }

  public getSizeConfig(): OverlaySizeConfig {
    const config = this.overlayRef.getConfig();
    return {
      width:     config.width,
      height:    config.height,
      minHeight: config.minHeight,
      minWidth:  config.minWidth,
      maxHeight: config.maxHeight,
      maxWidth:  config.maxWidth
    };
  }

  public setWidth(width: string): void {
    this.overlayRef.updateSize({
      ...this.getSizeConfig(),
      width
    });
    this.width$.next(width);
  }

  public setHeight(height: string): void {
    this.overlayRef.updateSize({
      ...this.getSizeConfig(),
      height
    });
    this.height$.next(height);
  }

  public getWidth(): string {
    // tslint:disable-next-line:no-non-null-assertion
    return this.getSizeConfig().width! + '';
  }

  public getHeight(): string {
    // tslint:disable-next-line:no-non-null-assertion
    return this.getSizeConfig().height! + '';
  }

  public setPos(x: string, y: string): void {
    this.overlayRef.updatePositionStrategy(this
      .overlay
      .position()
      .global()
      .top(y)
      .left(x)
    );
    this.overlayRef.updatePosition();
  }

  public fullScreen(): void {
    this.setWidth('100vw');
    this.setHeight('100vh');
    this.setPos('0px', '0px');
  }

}
