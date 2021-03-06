import {
  Component,
  OnInit,
  Input,
  ElementRef,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import {
  fromEvent,
  Subscription
} from 'rxjs';
import {
  tap,
  switchMap,
  takeUntil,
  map,
  filter,
  finalize
} from 'rxjs/operators';
import { RXAP_WINDOW_CONTEXT } from '../tokens';
import { WindowRef } from '../window-ref';
import { Required } from '@rxap/utilities';

@Component({
  selector:        'rxap-window-resizer',
  templateUrl:     './window-resizer.component.html',
  styleUrls:       [ './window-resizer.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowResizerComponent implements OnInit, OnDestroy {

  @Input() @Required public containerRef!: ElementRef<any>;

  public windowRef: WindowRef<any>;

  @ViewChild('resizer', { static: true }) public resizerRef!: ElementRef<any>;

  @Output('width') public width$       = new EventEmitter<string>();
  @Output('height') public height$     = new EventEmitter<string>();
  @Output('resizing') public resizing$ = new EventEmitter<boolean>();

  private _subscription = new Subscription();

  constructor(
    @Inject(RXAP_WINDOW_CONTEXT) context: any
  ) {
    this.windowRef = context.windowRef;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngOnInit() {

    let originalMouseX = 0;
    let originalMouseY = 0;
    let originalWidth  = 0;
    let originalHeight = 0;

    this._subscription.add(
      fromEvent<MouseEvent>(this.resizerRef.nativeElement, 'mousedown').pipe(
        tap(event => {
          this.resizing$.emit(true);
          originalMouseX = event.pageX;
          originalMouseY = event.pageY;
          originalWidth  = parseFloat(
            getComputedStyle(this.containerRef.nativeElement, null)
              .getPropertyValue('width')
              .replace('px', '')
          );
          originalHeight = parseFloat(
            getComputedStyle(this.containerRef.nativeElement, null)
              .getPropertyValue('height')
              .replace('px', '')
          );
        }),
        switchMap(() => fromEvent<MouseEvent>(window, 'mousemove').pipe(
          takeUntil(fromEvent(window, 'mouseup')),
          map((event) => ({
            width:  originalWidth + (event.pageX - originalMouseX),
            height: originalHeight + (event.pageY - originalMouseY)
          })),
          filter(size => (Number(this.windowRef.getSizeConfig().minHeight) || 0) <=
                         size.height &&
                         (Number(this.windowRef.getSizeConfig().minWidth) || 0) <=
                         size.width),
          map(size => ({ width: size.width + 'px', height: size.height + 'px' })),
          tap(size => {
            this.width$.emit(size.width);
            this.height$.emit(size.height);
          }),
          tap(size => {
            this.windowRef.setHeight(size.height);
            this.windowRef.setWidth(size.width);
          }),
          finalize(() => this.resizing$.emit(false))
          )
        )
      ).subscribe()
    );

  }

}
