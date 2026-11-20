import { Directive, effect, inject, input, isDevMode, Renderer2 } from '@angular/core';
import {
  fromEvent,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[rxapMovableDivider]',
  standalone: true,
  host: {
    style: 'cursor: ew-resize',
    '(mousedown)': 'onMousedown()',
  },
})
export class MovableDividerDirective {
  private readonly renderer = inject(Renderer2);


  public readonly containerElement = input.required<HTMLDivElement>();

  public readonly fixedElement = input.required<HTMLDivElement>();

  public readonly origin = input<'right' | 'left'>('right');

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

  constructor() {
    effect((onCleanup) => {
      const containerElement = this.containerElement();
      const subscription = new Subscription();
      onCleanup(() => subscription.unsubscribe());
      this.listen(containerElement, subscription);
    });
  }

  private listen(containerElement: HTMLDivElement, subscription: Subscription) {
    subscription.add(fromEvent<MouseEvent>(containerElement, 'mousemove').pipe(
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
    subscription.add(fromEvent(containerElement, 'mouseup').pipe(
      tap(() => this._moveDivider = false),
    ).subscribe());
  }

  public onMousedown() {
    this._moveDivider = true;
  }

}


