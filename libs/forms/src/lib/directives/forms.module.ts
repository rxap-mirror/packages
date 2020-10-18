import { NgModule } from '@angular/core';
import { FormDirective } from './form.directive';
import { FormSubmitFailedDirective } from './form-submit-failed.directive';
import { FormLoadingDirective } from './form-loading.directive';
import { FormSubmittingDirective } from './form-submitting.directive';
import { FormLoadingErrorDirective } from './form-loading-error.directive';
import { FormLoadedDirective } from './form-loaded.directive';
import { FormControlErrorDirective } from './form-control-error.directive';
import { FormControlMarkDirtyDirective } from './form-control-mark-dirty.directive';
import { FormControlMarkTouchedDirective } from './form-control-mark-touched.directive';
import { FormControlMarkUntouchedDirective } from './form-control-mark-untouched.directive';
import { FormControlMarkPristineDirective } from './form-control-mark-pristine.directive';
import { FormSubmitDirective } from './form-submit.directive';
import { FormGroupNameDirective } from './form-group-name.directive';
import { FormControlNameDirective } from './form-control-name.directive';
import { ParentControlContainerDirective } from './parent-control-container.directive';


@NgModule({
  declarations: [
    FormDirective,
    FormSubmitFailedDirective,
    FormLoadingDirective,
    FormSubmittingDirective,
    FormLoadingErrorDirective,
    FormLoadedDirective,
    FormControlErrorDirective,
    FormControlMarkDirtyDirective,
    FormControlMarkTouchedDirective,
    FormControlMarkUntouchedDirective,
    FormControlMarkPristineDirective,
    FormSubmitDirective,
    FormGroupNameDirective,
    FormControlNameDirective,
    ParentControlContainerDirective
  ],
  exports:      [
    FormDirective,
    FormSubmitFailedDirective,
    FormLoadingDirective,
    FormSubmittingDirective,
    FormLoadingErrorDirective,
    FormLoadedDirective,
    FormControlErrorDirective,
    FormControlMarkDirtyDirective,
    FormControlMarkTouchedDirective,
    FormControlMarkUntouchedDirective,
    FormControlMarkPristineDirective,
    FormSubmitDirective,
    FormGroupNameDirective,
    FormControlNameDirective,
    ParentControlContainerDirective
  ]
})
export class RxapFormsModule {}
