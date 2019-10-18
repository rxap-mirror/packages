import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  Renderer2,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { InputFormControl } from '../../forms/form-controls/input.form-control';
import {
  fromEvent,
  Subscription
} from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { BaseControlComponent } from '../base-control.component';

export class InputControlErrorStateMatcher implements ErrorStateMatcher {

  constructor(public readonly control: InputFormControl<any>) {}

  isErrorState(): boolean {
    return this.control.hasError();
  }
}

@RxapComponent(RxapFormControlComponentIds.INPUT)
@Component({
  selector:        'rxap-input-control',
  templateUrl:     './input-control.component.html',
  styleUrls:       [ './input-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RxapInputControlComponent<ControlValue>
  extends BaseControlComponent<ControlValue, InputFormControl<ControlValue>>
  implements OnInit, OnDestroy {

  @ViewChild('inputElement', { static: true }) public inputElement: ElementRef;

  public subscriptions = new Subscription();

  public errorStateMatcher: InputControlErrorStateMatcher;

  constructor(
    public renderer: Renderer2,
    public cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnInit(): void {

    this.errorStateMatcher = new InputControlErrorStateMatcher(this.control);

    this.subscriptions.add(
      fromEvent<KeyboardEvent>(this.inputElement.nativeElement, 'keyup')
        .pipe(
          map($event => $event.target['value'] || null),
          tap(value => this.control.setValue(value)),
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.control.valueChange$.pipe(
        tap(() => this.cdr.markForCheck())
      ).subscribe()
    );

    if (this.control.max !== null) {
      switch (this.control.type) {

        case 'text':
          this.renderer.setAttribute(this.inputElement.nativeElement, 'maxlength', this.control.max.toFixed(0));
          break;

        case 'number':
          this.renderer.setAttribute(this.inputElement.nativeElement, 'max', this.control.max.toFixed(0));
          break;

        default:
          console.log('max is not supported', this.control);

      }
    }
    if (this.control.min !== null) {
      switch (this.control.type) {

        case 'text':
          this.renderer.setAttribute(this.inputElement.nativeElement, 'minlength', this.control.min.toFixed(0));
          break;

        case 'number':
          this.renderer.setAttribute(this.inputElement.nativeElement, 'min', this.control.min.toFixed(0));
          break;

        default:
          console.log('max is not supported', this.control);

      }
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
