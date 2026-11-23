import { Directive, effect, inject, input, isDevMode, Renderer2 } from '@angular/core';
import {
  fromEvent,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { Showcase } from '@ng-prism/core';

@Showcase<MovableDividerDirective>({
  title: 'Movable Divider',
  category: 'Directives',
  description: 'Turns the host element into a divider that resizes a fixed element inside a container by dragging. The `origin` defines on which side of the divider the fixed element is placed.',
  status: 'stable',
  variants: [
    {
      name: 'Fixed element left',
      description: 'The default origin `right` measures the width of the fixed element from the left edge of the container.',
      host: {
        template: '<div #container style="display: flex; width: 480px; height: 120px; border: 1px solid #9e9e9e"><div #fixed style="flex-basis: 160px; padding: 8px; background: #e3f2fd">Fixed</div><div rxapMovableDivider [containerElement]="container" [fixedElement]="fixed" style="width: 6px; background: #9e9e9e"></div><div style="flex: 1; padding: 8px">Flexible</div></div>',
      },
    },
    {
      name: 'Fixed element right',
      description: 'With the origin `left` the width of the fixed element is measured from the right edge of the container.',
      host: {
        template: '<div #container style="display: flex; width: 480px; height: 120px; border: 1px solid #9e9e9e"><div style="flex: 1; padding: 8px">Flexible</div><div rxapMovableDivider origin="left" [containerElement]="container" [fixedElement]="fixed" style="width: 6px; background: #9e9e9e"></div><div #fixed style="flex-basis: 160px; padding: 8px; background: #e3f2fd">Fixed</div></div>',
      },
    },
  ],
})
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


