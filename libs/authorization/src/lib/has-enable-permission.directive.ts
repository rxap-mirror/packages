import {
  ChangeDetectorRef,
  Directive,
  Inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatLegacyButton as MatButton } from '@angular/material/legacy-button';
import { MatLegacyInput as MatInput } from '@angular/material/legacy-input';
import { MatLegacySelect as MatSelect } from '@angular/material/legacy-select';
import { MatLegacyCheckbox as MatCheckbox } from '@angular/material/legacy-checkbox';
import { MatLegacySlideToggle as MatSlideToggle } from '@angular/material/legacy-slide-toggle';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl
} from '@angular/forms';
import { RXAP_AUTHORIZATION_SCOPE } from './tokens';

@Injectable()
export abstract class HasEnablePermission implements OnInit, OnDestroy {
  @Required
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
    private readonly valueAccessor: ControlValueAccessor[] | null = null
  ) {}

  public ngOnInit() {
    this._subscription = this.authorization
      .hasPermission(this.identifier, this.scope || null)
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
        })
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public abstract setDisabled(disabled: boolean): void;
}

@Directive({
  selector:   'button[rxapHasEnablePermission],[mat-button][rxapHasEnablePermission],[mat-raised-button][rxapHasEnablePermission],[mat-stroked-button][rxapHasEnablePermission],[mat-flat-button][rxapHasEnablePermission],[mat-icon-button][rxapHasEnablePermission],[mat-fab][rxapHasEnablePermission],[mat-mini-fab][rxapHasEnablePermission]',
  standalone: true
})
export class MatButtonHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

  constructor(
    @Inject(AuthorizationService)
    authorization: AuthorizationService,
    @Inject(ChangeDetectorRef)
    cdr: ChangeDetectorRef,
    @Inject(MatButton)
    private readonly matButton: MatButton,
    @Optional()
    @Inject(RXAP_AUTHORIZATION_SCOPE)
    scope: string
  ) {
    super(authorization, cdr, scope);
  }

  public setDisabled(disabled: boolean): void {
    this.matButton.disabled = disabled;
  }
}

@Directive({
  selector:   '[matInput][rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true
})
export class MatInputHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

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
    valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matInput.disabled = disabled;
  }
}

@Directive({
  selector:   'mat-select[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true
})
export class MatSelectHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

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
    valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSelect.disabled = disabled;
  }
}

@Directive({
  selector:   'mat-checkbox[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true
})
export class MatCheckboxHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

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
    valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matCheckbox.disabled = disabled;
  }
}

@Directive({
  selector:   'mat-slide-toggle[rxapHasEnablePermission]:not([formControl]):not([formControlName])',
  standalone: true
})
export class MatSlideToggleHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

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
    valueAccessor: ControlValueAccessor[] | null = null
  ) {
    super(authorization, cdr, scope, valueAccessor);
  }

  public setDisabled(disabled: boolean) {
    this.matSlideToggle.disabled = disabled;
  }
}

@Directive({
  selector:   '[formControl][rxapHasEnablePermission],[formControlName][rxapHasEnablePermission]',
  standalone: true
})
export class FormControlHasEnablePermissionDirective extends HasEnablePermission {
  @Input('rxapHasEnablePermission')
  public identifier!: string;

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
    private readonly ngControl: NgControl
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
