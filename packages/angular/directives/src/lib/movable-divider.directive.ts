import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Renderer2,
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

  @Input({ required: true })
  public containerElement!: HTMLDivElement;

  @Input({ required: true })
  public fixedElement!: HTMLDivElement;

  @Input()
  public origin: 'right' | 'left' = 'right';
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
    this._subscription.add(fromEvent<MouseEvent>(this.containerElement, 'mousemove').pipe(
      tap(($event: MouseEvent) => {
        if (this._moveDivider) {
          if (!this._fixedElementWidth) {
            this._fixedElementWidth = this.fixedElement.clientWidth as number;
          }
          if (this.origin === 'right') {
            this._fixedElementWidth = $event.clientX - this.containerElement.getBoundingClientRect().left;
          } else if (this.origin === 'left') {
            if (isDevMode()) {
              console.log({
                clientWidth: this.containerElement.clientWidth,
                clientX: $event.clientX,
                clientLeft: this.containerElement.getBoundingClientRect().left,
              });
            }
            this._fixedElementWidth =
              this.containerElement.clientWidth - $event.clientX + this.containerElement.getBoundingClientRect().left;
          } else {
            throw new Error(`The origin '${ this.origin }' is not supported.`);
          }
          const width = this._fixedElementWidth + 'px';
          this.renderer.setStyle(this.fixedElement, 'max-width', width);
          this.renderer.setStyle(this.fixedElement, 'min-width', width);
          this.renderer.setStyle(this.fixedElement, 'flex-basis', width);
        }
      }),
    ).subscribe());
    this._subscription.add(fromEvent(this.containerElement, 'mouseup').pipe(
      tap(() => this._moveDivider = false),
    ).subscribe());
  }

  @HostListener('mousedown')
  public onMousedown() {
    this._moveDivider = true;
  }

}


