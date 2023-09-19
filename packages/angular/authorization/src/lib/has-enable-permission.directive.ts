import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { CanDisable } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from './authorization.service';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Injectable()
export abstract class HasEnablePermission implements OnInit, OnDestroy {
  public identifier!: string;

  private _subscription?: Subscription;

  constructor(
    @Inject(AuthorizationService)
    private readonly authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
    private readonly scope: string | null = null,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
    private readonly valueAccessor: ControlValueAccessor[] | null = null,
  ) {
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit() {
    this._subscription = this
      .authorization
      .hasPermission$(this.identifier, this.scope || null)
      .pipe(
        tap((hasPermission) => {
          this.setDisabled(!hasPermission);
          if (this.valueAccessor) {
            this.valueAccessor.forEach((value) => {
              if (value.setDisabledState) {
                value.setDisabledState(!hasPermission);
              }
            });
          }
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public abstract setDisabled(disabled: boolean): void;
}

@Directive({
  selector: 'button[rxapHasEnablePermission],[mat-button][rxapHasEnablePermission],[mat-raised-button][rxapHasEnablePermission],[mat-stroked-button][rxapHasEnablePermission],[mat-flat-button][rxapHasEnablePermission],[mat-icon-button][rxapHasEnablePermission],[mat-fab][rxapHasEnablePermission],[mat-mini-fab][rxapHasEnablePermission]',
  standalone: true,
})
export class MatButtonHasEnablePermissionDirective extends HasEnablePermission implements OnInit {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  private _button!: CanDisable;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
  ) {
    super(authorization, cdr, scope);
  }

  public setDisabled(disabled: boolean): void {
    this._button.disabled = disabled;
  }

  override ngOnInit() {
    this._button = this.injector.get<CanDisable>(
      MatButton,
      this.injector.get(MatIconButton, this.injector.get(MatMiniFabButton, this.injector.get(MatFabButton, null))),
    );
    if (!this._button) {
      throw new Error('Could not inject the mat button instance!');
    }
    // must be called after the button is injected
    // the setDisabled method is called in the super.ngOnInit method
    super.ngOnInit();
  }

}

@Directive({
  selector: '[matInput][rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatInputHasEnablePermissionDirective extends HasEnablePermission {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatInput)
    private readonly matInput: MatInput,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matInput.disabled = disabled;
  }
}

@Directive({
  selector: 'mat-select[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSelectHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatSelect)
    private readonly matSelect: MatSelect,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSelect.disabled = disabled;
  }
}

@Directive({
  selector: 'mat-checkbox[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatCheckboxHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatCheckbox)
    private readonly matCheckbox: MatCheckbox,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matCheckbox.disabled = disabled;
  }
}

@Directive({
  selector: 'mat-slide-toggle[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true,
})
export class MatSlideToggleHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Inject(MatSlideToggle)
    private readonly matSlideToggle: MatSlideToggle,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSlideToggle.disabled = disabled;
  }
}

@Directive({
  selector: '[formControl][rxapHasEnablePermission],[formControlName][rxapHasEnablePermission]',
  standalone: true,
})
export class FormControlHasEnablePermissionDirective extends HasEnablePermission {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapHasEnablePermission')
  public override identifier!: string;

  constructor(
    @Inject(AuthorizationService)
      authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
      cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
      scope: string,
    @Optional()
    @Inject(NG_VALUE_ACCESSOR)
      valueAccessor: ControlValueAccessor[] | null = null,
    @Inject(NgControl)
    private readonly ngControl: NgControl,
  ) {
    super(authorization, cdr, scope, valueAccessor);
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
