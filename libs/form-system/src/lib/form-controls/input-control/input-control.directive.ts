import {
  Directive,
  Renderer2,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  HostBinding
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  InputFormControl,
  InputTypes
} from '../../forms/form-controls/input.form-control';
import { MatInput } from '@angular/material';
import { Required } from '@rxap/utilities';

@Directive({
  selector: 'input[rxapInputControl]'
})
export class InputControlDirective
  implements OnInit, OnDestroy {

  public subscriptions = new Subscription();

  @Input() @Required public control!: InputFormControl<any>;

  @HostBinding('placeholder') public placeholder!: string;
  @HostBinding('type') public type!: InputTypes;
  @HostBinding('readonly') public readonly!: boolean;
  @HostBinding('disabled') public disabled!: boolean;
  @HostBinding('pattern') public pattern!: RegExp | null;
  @HostBinding('required') public required!: boolean;
  @HostBinding('name') public name!: string;

  constructor(
    public renderer: Renderer2,
    public cdr: ChangeDetectorRef,
    public elementRef: ElementRef,
    public matInput: MatInput
  ) {}

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setInputAttributes() {
    this.matInput.errorStateMatcher = this.control.errorStateMatcher;

    this.placeholder = this.control.placeholder;
    this.type        = this.control.type;
    this.readonly    = this.control.readonly;
    this.disabled    = this.control.disabled;
    this.pattern     = this.control.pattern;
    this.required    = this.control.required;
    this.name        = this.control.name;
  }

  public ngOnInit(): void {

    this.setInputAttributes();

    this.subscriptions.add(
      this.control.valueChange$.pipe(
        tap(() => this.cdr.markForCheck())
      ).subscribe()
    );

    this.subscriptions.add(
      this.control.updateView$.pipe(
        tap(() => this.setInputAttributes()),
        tap(() => this.cdr.markForCheck())
      ).subscribe()
    );

    if (this.control.max !== null) {
      switch (this.control.type) {

        case 'text':
          this.renderer.setAttribute(this.elementRef.nativeElement, 'maxlength', this.control.max.toFixed(0));
          break;

        case 'number':
          this.renderer.setAttribute(this.elementRef.nativeElement, 'max', this.control.max.toFixed(0));
          break;

        default:
          console.log('max is not supported', this.control);

      }
    }
    if (this.control.min !== null) {
      switch (this.control.type) {

        case 'text':
          this.renderer.setAttribute(this.elementRef.nativeElement, 'minlength', this.control.min.toFixed(0));
          break;

        case 'number':
          this.renderer.setAttribute(this.elementRef.nativeElement, 'min', this.control.min.toFixed(0));
          break;

        default:
          console.log('min is not supported', this.control);

      }
    }
  }

}
