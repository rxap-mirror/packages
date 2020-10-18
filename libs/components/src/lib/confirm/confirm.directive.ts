import {
  Directive,
  HostListener,
  ElementRef,
  EventEmitter,
  Output,
  OnDestroy,
  Input
} from '@angular/core';
import { ConfirmComponent } from './confirm.component';
import {
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  first,
  tap
} from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[rxapConfirm]'
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

  constructor(
    private readonly overlay: Overlay,
    private readonly elementRef: ElementRef
  ) {}

  @HostListener('click')
  public onClick() {

    if (this.subscription) {
      return;
    }

    this.overlayRef      = this.overlay.create({
      scrollStrategy:   this.overlay.scrollStrategies.close(),
      positionStrategy: this.overlay
                            .position()
                            .flexibleConnectedTo(this.elementRef.nativeElement)
                            .withPositions([
                              {
                                originX:  'start',
                                originY:  'bottom',
                                overlayX: 'start',
                                overlayY: 'top'
                              }
                            ]).withDefaultOffsetY(10)
    });
    const componentPortal = new ComponentPortal(ConfirmComponent);

    const componentRef = this.overlayRef.attach(componentPortal);

    this.subscription = new Subscription();

    this.subscription.add(componentRef.instance.confirmed.pipe(
      first(),
      tap(() => this.confirmed.emit(this._eventValue)),
      tap(() => this.overlayRef?.dispose()),
      tap(() => this.subscription = null),
      tap(() => this.subscription?.unsubscribe())
    ).subscribe());

    this.subscription.add(componentRef.instance.unconfirmed.pipe(
      first(),
      tap(() => this.unconfirmed.emit(this._eventValue)),
      tap(() => this.overlayRef?.dispose()),
      tap(() => this.subscription = null),
      tap(() => this.subscription?.unsubscribe())
    ).subscribe());

    this.subscription.add(this.overlayRef.detachments().pipe(
      first(),
      tap(() => this.subscription = null),
      tap(() => this.subscription?.unsubscribe())
    ).subscribe());

  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.overlayRef?.dispose();
  }

}
