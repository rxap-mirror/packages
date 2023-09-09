import {
  Injectable,
  StaticProvider,
} from '@angular/core';
import { MatStepperIntl } from '@angular/material/stepper';
import { Subject } from 'rxjs';

declare let $localize: any;

@Injectable()
export class I18nMatStepperIntl implements MatStepperIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** Label that is rendered below optional steps. */
  optionalLabel: string = $localize`:@@optionalLabelMatStepper:Optional`;

  /** Label that is used to indicate step as completed to screen readers. */
  completedLabel: string = $localize`:@@completedLabelMatStepper:Completed`;

  /** Label that is used to indicate step as editable to screen readers. */
  editableLabel: string = $localize`:@@editableLabelMatStepper:Editable`;
}

export const I18N_MAT_STEPPER_INTL_PROVIDER: StaticProvider = {
  provide: MatStepperIntl,
  useClass: I18nMatStepperIntl,
};

export function ProvideI18nMatStepperIntl() {
  return I18N_MAT_STEPPER_INTL_PROVIDER;
}
