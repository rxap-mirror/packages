import {
  Directive,
  HostBinding,
  HostListener,
  isDevMode,
  OnDestroy,
  OnInit,
  Renderer2,
  input
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  fromEvent,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[rxapMovableDivider]',
  standalone: true,
})
export class MovableDividerDirective implements OnDestroy, OnInit {

  public readonly containerElement = input.required<HTMLDivElement>();

  public readonly fixedElement = input.required<HTMLDivElement>();

  public readonly origin = input<'right' | 'left'>('right');
  @HostBinding('style.cursor')
  public cursor = 'ew-resize';
  private _subscription = new Subscription();
  /**
   * Indicates that the divider is moved with mouse down
   * @private
   */
  private _moveDivider = false;
  /**
   * Holds the current fixed element width.
   * If null the move divider feature was not yet used and the initial
   * fixed element width is not calculated
   * @private
   */
  private _fixedElementWidth: number | null = null;

  constructor(private readonly renderer: Renderer2) {
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    const containerElement = this.containerElement();
    this._subscription.add(fromEvent<MouseEvent>(containerElement, 'mousemove').pipe(
      tap(($event: MouseEvent) => {
        if (this._moveDivider) {
          if (!this._fixedElementWidth) {
            this._fixedElementWidth = this.fixedElement().clientWidth as number;
          }
          const origin = this.origin();
          if (origin === 'right') {
            this._fixedElementWidth = $event.clientX - this.containerElement().getBoundingClientRect().left;
          } else if (origin === 'left') {
            const containerElementValue = this.containerElement();
            if (isDevMode()) {
              console.log({
                clientWidth: containerElementValue.clientWidth,
                clientX: $event.clientX,
                clientLeft: containerElementValue.getBoundingClientRect().left,
              });
            }
            this._fixedElementWidth =
              containerElementValue.clientWidth - $event.clientX + containerElementValue.getBoundingClientRect().left;
          } else {
            throw new Error(`The origin '${ origin }' is not supported.`);
          }
          const width = this._fixedElementWidth + 'px';
          const fixedElement = this.fixedElement();
          this.renderer.setStyle(fixedElement, 'max-width', width);
          this.renderer.setStyle(fixedElement, 'min-width', width);
          this.renderer.setStyle(fixedElement, 'flex-basis', width);
        }
      }),
    ).subscribe());
    this._subscription.add(fromEvent(containerElement, 'mouseup').pipe(
      tap(() => this._moveDivider = false),
    ).subscribe());
  }

  @HostListener('mousedown')
  public onMousedown() {
    this._moveDivider = true;
  }

}


