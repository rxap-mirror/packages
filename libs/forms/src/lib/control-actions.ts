import {
  defer,
  merge,
  Observable,
  of,
  Subscription,
  EMPTY
} from 'rxjs';
import {
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import {
  AbstractControl,
  ControlOptions,
  ControlState,
  ValidatorFn,
  ControlPath
} from './types';
import {
  coerceArray,
  equals
} from '@rxap/utilities';
import { RxapFormArray } from './form-array';
import { RxapFormGroup } from './form-group';
import { RxapFormControl } from './form-control';

function getControlValue<T>(control: AbstractControl<T>): T {
  if ((control as any).getRawValue) {
    return (control as any).getRawValue();
  }
  return control.value;
}

export function controlValueChanges$<T>(control: AbstractControl<T>): Observable<T> {
  return merge(
    defer(() => of(getControlValue(control))),
    control.valueChanges.pipe(map(() => getControlValue(control)))
  );
}

export function controlDisabled$<T>(control: AbstractControl<T>): Observable<boolean> {
  return merge(
    defer(() => of(control.disabled)),
    merge(control.statusChanges, control.stateChanges ?? EMPTY).pipe(
      map(() => control.disabled),
      distinctUntilChanged()
    )
  );
}

export function controlEnabled$<T>(control: AbstractControl<T>): Observable<boolean> {
  return merge(
    defer(() => of(control.enabled)),
    merge(control.statusChanges, control.stateChanges ?? EMPTY).pipe(
      map(() => control.enabled),
      distinctUntilChanged()
    )
  );
}

export function controlReadonly$<T>(control: AbstractControl<T>): Observable<boolean> {
  return merge(
    defer(() => of(control.readonly ?? false)),
    merge(control.statusChanges, control.stateChanges ?? EMPTY).pipe(
      map(() => control.readonly ?? false),
      distinctUntilChanged()
    )
  );
}

export function controlStatusChanges$<T>(control: AbstractControl<T>): Observable<ControlState> {
  return merge(
    defer(() => of(control.status as ControlState)),
    control.statusChanges.pipe(
      map(() => control.status as ControlState),
      distinctUntilChanged()
    )
  );
}

export function controlErrorChanges$<E>(control: AbstractControl): Observable<E | null> {
  return merge(
    defer(() => of(control.errors as E)),
    control.valueChanges.pipe(
      map(() => control.errors as E)
    ),
    control.statusChanges.pipe(
      map(() => control.errors as E)
    )
  ).pipe(distinctUntilChanged((a, b) => equals(a, b)));
}

export function enableControl<T>(control: AbstractControl<T>, enabled: boolean, opts?: ControlOptions): void {
  if (enabled) {
    control.enable(opts);
  } else {
    control.disable(opts);
  }
}

export function disableControl<T>(control: AbstractControl<T>, disabled: boolean, opts?: ControlOptions): void {
  enableControl(control, !disabled, opts);
}

export function controlDisabledWhile<T>(
  control: AbstractControl<T>,
  observable: Observable<boolean>,
  opts?: ControlOptions
): Subscription {
  return observable.subscribe(isDisabled => disableControl(control, isDisabled, opts));
}

export function controlEnabledWhile<T>(
  control: AbstractControl<T>,
  observable: Observable<boolean>,
  opts?: ControlOptions
): Subscription {
  return observable.subscribe(isEnabled => enableControl(control, isEnabled, opts));
}

export function mergeControlValidators<T, Control extends AbstractControl<T>>(
  control: Control,
  validators: ValidatorFn<T> | ValidatorFn<T>[]
): void {
  control.setValidators([ ...coerceArray(control.validator), ...coerceArray(validators) ]);
  control.updateValueAndValidity();
}

export function validateControlOn<T>(control: AbstractControl<T>, validation: Observable<null | object>): Subscription {
  return validation.subscribe(maybeError => {
    control.setErrors(maybeError);
  });
}

export function hasErrorAndTouched<T>(control: AbstractControl<T>, error: string, path?: ControlPath): boolean {
  const hasError = control.hasError(error, !path || path.length === 0 ? undefined : path);
  return hasError && control.touched;
}

export function hasErrorAndDirty<T>(control: AbstractControl<T>, error: string, path?: ControlPath): boolean {
  const hasError = control.hasError(error, !path || path.length === 0 ? undefined : path);
  return hasError && control.dirty;
}

export function markAllDirty<T>(control: RxapFormArray<T> | RxapFormGroup<T>): void {
  control.markAsDirty({ onlySelf: true });
  (control as any)._forEachChild((_control: any) => _control.markAllAsDirty());
}

export function markAllPristine<T>(control: RxapFormArray<T> | RxapFormGroup<T>): void {
  control.markAsPristine({ onlySelf: true });
  (control as any)._forEachChild((_control: any) => _control.markAllAsPristine());
}

export function markAllUntouched<T>(control: RxapFormArray<T> | RxapFormGroup<T>): void {
  control.markAsUntouched({ onlySelf: true });
  (control as any)._forEachChild((_control: any) => _control.markAllAsUntouched());
}

export function selectControlValue$<T, R>(
  control: RxapFormGroup<T> | RxapFormArray<T> | RxapFormControl<T>,
  mapFn: (state: T) => R
): Observable<R> {
  return (control.value$ as Observable<any>).pipe(map(mapFn), distinctUntilChanged());
}
