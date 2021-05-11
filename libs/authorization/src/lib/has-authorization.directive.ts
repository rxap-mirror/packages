import {
  Directive,
  NgModule,
  OnInit,
  Attribute,
  HostBinding,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  Injectable,
  AfterViewInit,
  Inject,
  Optional,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { AuthorizationService } from './authorization.service';
import {
  Required,
  log
} from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl
} from '@angular/forms';

@Injectable()
export abstract class HasAuthorizationDirective implements OnInit, OnDestroy {

  @Required
  public identifier!: string;

  private _subscription?: Subscription;

  constructor(
    private readonly authorization: AuthorizationService,
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
    private readonly valueAccessor: ControlValueAccessor[] | null = null
  ) { }

  public ngOnInit() {
    this._subscription = this.authorization.isDisabled$(this.identifier).pipe(
      tap(disabled => {
        this.setDisabled(disabled);
        if (this.valueAccessor) {
          this.valueAccessor.forEach(value => {
            if (value.setDisabledState) {
              // value.setDisabledState(disabled);
            }
          });
        }
        this.cdr.markForCheck();
      })
    ).subscribe();
    this.setDisabled(this.authorization.isDisabled(this.identifier));
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public abstract setDisabled(disabled: boolean): void;

}

@Directive({
  selector: '[mat-button][rxapHasAuthorization],[mat-raised-button][rxapHasAuthorization],[mat-stroked-button][rxapHasAuthorization],[mat-flat-button][rxapHasAuthorization],[mat-icon-button][rxapHasAuthorization],[mat-fab][rxapHasAuthorization],[mat-mini-fab][rxapHasAuthorization]'
})
export class MatButtonHasAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    private readonly matButton: MatButton
  ) {
    super(authorization, cdr);
  }

  public setDisabled(disabled: boolean): void {
    this.matButton.disabled = disabled;
  }

}

@Directive({
  selector: '[matInput][rxapHasAuthorization]:not([formControl]):not([formControlName])'
})
export class MatInputHasAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    private readonly matInput: MatInput,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matInput.disabled = disabled;
  }

}

@Directive({
  selector: 'mat-select[rxapHasAuthorization]:not([formControl]):not([formControlName])'
})
export class MatSelectHasAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    private readonly matSelect: MatSelect,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSelect.disabled = disabled;
  }

}

@Directive({
  selector: 'mat-checkbox[rxapHasAuthorization]:not([formControl]):not([formControlName])'
})
export class MatCheckboxHasAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    private readonly matCheckbox: MatCheckbox,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matCheckbox.disabled = disabled;
  }

}

@Directive({
  selector: 'mat-slide-toggle[rxapHasAuthorization]:not([formControl]):not([formControlName])'
})
export class MatSlideToggleHasAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    private readonly matSlideToggle: MatSlideToggle,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSlideToggle.disabled = disabled;
  }

}

@Directive({
  selector: '[formControl][rxapHasAuthorization],[formControlName][rxapHasAuthorization]'
})
export class FormControlAuthorizationDirective extends HasAuthorizationDirective {

  @Input('rxapHasAuthorization')
  public identifier!: string;

  constructor(
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
    private readonly ngControl: NgControl
  ) {
    super(authorization, cdr, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    if (this.ngControl.control) {
      if (disabled) {
        this.ngControl.control.disable();
      } else {
        this.ngControl.control.enable();
      }
    }
  }

}


@Directive({
  selector: 'rxapHasAuthorization'
})
export class HasAuthorizationTemplateDirective extends HasAuthorizationDirective {

  @Input()
  public identifier!: string;

  constructor(
    private readonly template: TemplateRef<void>,
    private readonly viewContainerRef: ViewContainerRef,
    authorization: AuthorizationService,
    cdr: ChangeDetectorRef,
  ) {
    super(authorization, cdr);
  }

  public setDisabled(disabled: boolean) {
    if (disabled) {
      this.viewContainerRef.clear();
    } else {
      this.viewContainerRef.createEmbeddedView(this.template);
    }
  }

}

@NgModule({
  declarations: [
    MatButtonHasAuthorizationDirective,
    MatInputHasAuthorizationDirective,
    MatSelectHasAuthorizationDirective,
    MatCheckboxHasAuthorizationDirective,
    MatSlideToggleHasAuthorizationDirective,
    FormControlAuthorizationDirective,
    HasAuthorizationTemplateDirective,
  ],
  exports:      [
    MatButtonHasAuthorizationDirective,
    MatInputHasAuthorizationDirective,
    MatSelectHasAuthorizationDirective,
    MatCheckboxHasAuthorizationDirective,
    MatSlideToggleHasAuthorizationDirective,
    FormControlAuthorizationDirective,
    HasAuthorizationTemplateDirective
  ]
})
export class HasAuthorizationDirectiveModule {}
