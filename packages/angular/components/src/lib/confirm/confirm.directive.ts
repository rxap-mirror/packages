import {
  Overlay,
  OverlayRef,
  PositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { computed, Directive, ElementRef, OnDestroy, output, input, inject } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import {
  take,
  tap,
} from 'rxjs/operators';
import { ConfirmComponent } from './confirm.component';

@Directive({
  selector: '[rxapConfirm]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class ConfirmDirective<T = any> implements OnDestroy {
  protected readonly overlay = inject<Overlay>(Overlay);
  protected readonly elementRef = inject<ElementRef>(ElementRef);

  // an input is used to allow auto import detection if the eventValue
  // is not set
  public readonly eventValueInput = input<T | ''>('', { alias: 'rxapConfirm' });

  public readonly eventValue = computed<T | undefined>(() => {
    const value = this.eventValueInput();
    return value !== '' ? value : undefined;
  });

  public readonly confirmed = output<T | undefined>();

  public readonly unconfirmed = output<T | undefined>();

  private subscription: Subscription | null = null;

  private overlayRef?: OverlayRef;

  protected positionStrategy?: PositionStrategy;

  protected isOverlyOpen = false;

  constructor() {
    this.positionStrategy = this.createPositionStrategy();
  }

  protected createPositionStrategy(): PositionStrategy {
    return this.overlay
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
    if (this.overlayRef) {
      // a position strategy can only be attached to a single overlay; the previous one is disposed
      this.positionStrategy = this.createPositionStrategy();
    }
    this.overlayRef = this.overlay.create({
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.positionStrategy,
    });
    const componentPortal = new ComponentPortal(ConfirmComponent);
    const componentRef = this.overlayRef.attach(componentPortal);

    this.subscription?.unsubscribe();
    this.subscription = new Subscription();

    this.subscription.add(
      outputToObservable(componentRef.instance.confirmed)
                  .pipe(
                    take(1),
                    tap(() => this.onConfirmed(this.eventValue())),
                    tap(() => this.overlayRef?.dispose()),
                    tap(() => this.isOverlyOpen = false),
                    tap(() => (this.subscription = null)),
                    tap(() => this.subscription?.unsubscribe()),
                  )
                  .subscribe(),
    );

    this.subscription.add(
      outputToObservable(componentRef.instance.unconfirmed)
                  .pipe(
                    take(1),
                    tap(() => this.onUnconfirmed(this.eventValue())),
                    tap(() => this.overlayRef?.dispose()),
                    tap(() => this.isOverlyOpen = false),
                    tap(() => (this.subscription = null)),
                    tap(() => this.subscription?.unsubscribe()),
                  )
                  .subscribe(),
    );

    this.subscription.add(
      this.overlayRef
          .detachments()
          .pipe(
            take(1),
            tap(() => this.isOverlyOpen = false),
            tap(() => (this.subscription = null)),
            tap(() => this.subscription?.unsubscribe()),
          )
          .subscribe(),
    );
  }

  protected onConfirmed(eventValue?: T) {
    this.confirmed.emit(eventValue);
  }

  protected onUnconfirmed(eventValue?: T) {
    this.unconfirmed.emit(eventValue);
  }

}
