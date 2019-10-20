import {
  Directive,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Input,
  HostBinding
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MatInput } from '@angular/material';
import { TextareaFormControl } from '../../forms/form-controls/textarea-form.control';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Required } from '@rxap/utilities';

@Directive({
  selector: 'textarea[rxapTextareaControl]'
})
export class TextareaControlDirective
  implements OnInit, OnDestroy {

  public subscriptions = new Subscription();

  @Input() @Required public control!: TextareaFormControl;

  @HostBinding('placeholder') public placeholder!: string;
  @HostBinding('readonly') public readonly!: boolean;
  @HostBinding('disabled') public disabled!: boolean;
  @HostBinding('required') public required!: boolean;
  @HostBinding('name') public name!: string;

  constructor(
    public cdr: ChangeDetectorRef,
    public matInput: MatInput,
    public cdkTextareaAutosize: CdkTextareaAutosize
  ) {}

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit(): void {

    this.matInput.errorStateMatcher = this.control.errorStateMatcher;

    console.log(this.control.placeholder);

    this.placeholder = this.control.placeholder;
    this.readonly    = this.control.readonly;
    this.disabled    = this.control.disabled;
    this.required    = this.control.required;
    this.name        = this.control.name;

    this.cdkTextareaAutosize.maxRows = this.control.maxRows;
    this.cdkTextareaAutosize.minRows = this.control.minRows;

    this.subscriptions.add(
      this.control.valueChange$.pipe(
        tap(() => this.cdr.markForCheck())
      ).subscribe()
    );

  }

}
