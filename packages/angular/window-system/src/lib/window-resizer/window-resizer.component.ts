import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, input, output, signal, viewChild, inject } from '@angular/core';
import {
  fromEvent,
  Subscription,
} from 'rxjs';
import {
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { WindowRef } from '../window-ref';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'rxap-window-resizer',
    templateUrl: './window-resizer.component.html',
    styleUrls: ['./window-resizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule, NgClass]
})
export class WindowResizerComponent implements OnDestroy {

  public readonly containerRef = input.required<ElementRef<any>>();

  public windowRef: WindowRef<any>;

  public readonly resizerRef = viewChild.required<ElementRef<any>>('resizer');

  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly width$ = output<string>({ alias: 'width' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly height$ = output<string>({ alias: 'height' });
  // eslint-disable-next-line @angular-eslint/no-output-rename
  public readonly resizing$ = output<boolean>({ alias: 'resizing' });

  /**
   * null until the first resize action has started
   */
  public readonly resizing = signal<boolean | null>(null);

  private _subscription = new Subscription();

  constructor() {
    const context = inject(RXAP_WINDOW_CONTEXT);

    this.windowRef = context.windowRef;

    afterNextRender(() => this.init());
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private init() {

    let originalMouseX = 0;
    let originalMouseY = 0;
    let originalWidth = 0;
    let originalHeight = 0;

    this._subscription.add(
      fromEvent<MouseEvent>(this.resizerRef().nativeElement, 'mousedown').pipe(
        tap(event => {
          this.resizing.set(true);
          this.resizing$.emit(true);
          originalMouseX = event.pageX;
          originalMouseY = event.pageY;
          originalWidth = parseFloat(
            getComputedStyle(this.containerRef().nativeElement, null)
              .getPropertyValue('width')
              .replace('px', ''),
          );
          originalHeight = parseFloat(
            getComputedStyle(this.containerRef().nativeElement, null)
              .getPropertyValue('height')
              .replace('px', ''),
          );
        }),
        switchMap(() => fromEvent<MouseEvent>(window, 'mousemove').pipe(
            takeUntil(fromEvent(window, 'mouseup')),
            map((event) => ({
              width: originalWidth + (event.pageX - originalMouseX),
              height: originalHeight + (event.pageY - originalMouseY),
            })),
            filter(size => (Number(this.windowRef.getSizeConfig().minHeight) || 0) <=
              size.height &&
              (Number(this.windowRef.getSizeConfig().minWidth) || 0) <=
              size.width),
            map(size => ({
              width: size.width + 'px',
              height: size.height + 'px',
            })),
            tap(size => {
              this.width$.emit(size.width);
              this.height$.emit(size.height);
            }),
            tap(size => {
              this.windowRef.setHeight(size.height);
              this.windowRef.setWidth(size.width);
            }),
            finalize(() => {
              this.resizing.set(false);
              this.resizing$.emit(false);
            }),
          ),
        ),
      ).subscribe(),
    );

  }

}
