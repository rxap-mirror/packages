import {
  Directive,
  HostListener,
  ElementRef,
  EventEmitter,
  Output,
  OnDestroy,
  Input,
  Inject,
} from '@angular/core';
import { ConfirmComponent } from './confirm.component';
import {
  Overlay,
  OverlayRef,
  PositionStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { tap, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[rxapConfirm]',
})
export class ConfirmDirective<T = any> implements OnDestroy {
  // use a set input to allow auto import detection if the eventValue
  // is not set
  @Input('rxapConfirm')
  public set eventValue(value: T | '') {
    if (value !== '') {
      this._eventValue = value;
    }
  }

  @Output()
  public confirmed = new EventEmitter<T | undefined>();

  @Output()
  public unconfirmed = new EventEmitter<T | undefined>();

  private subscription: Subscription | null = null;

  private overlayRef?: OverlayRef;

  private _eventValue?: T;

  protected positionStrategy?: PositionStrategy;

  protected isOverlyOpen = false;

  constructor(
    @Inject(Overlay)
    private readonly overlay: Overlay,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef
  ) {
    this.positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef.nativeElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ])
      .withDefaultOffsetY(10);
  }

  @HostListener('click', [ '$event' ])
  public onClick($event?: Event) {
    this.openConfirmOverly();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.overlayRef?.dispose();
  }

  protected openConfirmOverly() {
    if (this.isOverlyOpen) {
      return;
    }
    this.isOverlyOpen = true;
    this.overlayRef = this.overlay.create({
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.positionStrategy,
    });
    const componentPortal = new ComponentPortal(ConfirmComponent);
    const componentRef = this.overlayRef.attach(componentPortal);

    this.subscription?.unsubscribe();
    this.subscription = new Subscription();

    this.subscription.add(
      componentRef.instance.confirmed
                  .pipe(
                    take(1),
                    tap(() => this.onConfirmed(this._eventValue)),
                    tap(() => this.overlayRef?.dispose()),
                    tap(() => this.isOverlyOpen = false),
                    tap(() => (this.subscription = null)),
                    tap(() => this.subscription?.unsubscribe())
                  )
                  .subscribe()
    );

    this.subscription.add(
      componentRef.instance.unconfirmed
                  .pipe(
                    take(1),
                    tap(() => this.onUnconfirmed(this._eventValue)),
                    tap(() => this.overlayRef?.dispose()),
                    tap(() => this.isOverlyOpen = false),
                    tap(() => (this.subscription = null)),
                    tap(() => this.subscription?.unsubscribe())
                  )
                  .subscribe()
    );

    this.subscription.add(
      this.overlayRef
          .detachments()
          .pipe(
            take(1),
            tap(() => this.isOverlyOpen = false),
            tap(() => (this.subscription = null)),
            tap(() => this.subscription?.unsubscribe())
          )
          .subscribe()
    );
  }

  protected onConfirmed(eventValue?: T) {
    this.confirmed.emit(eventValue);
  }

  protected onUnconfirmed(eventValue?: T) {
    this.unconfirmed.emit(eventValue);
  }

}
