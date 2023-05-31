/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive } from '@angular/core';
import {
  CdkEditControl,
  CdkEditClose,
  CdkEditRevert
} from './cdk/lens-directives';
import { EditRef } from './cdk/edit-ref';

/**
 * A component that attaches to a form within the edit.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit when the form is submitted or the user clicks
 * out.
 */
@Directive({
  selector:   'form[matEditLens]',
  host:       {
    'class': 'mat-edit-lens'
  },
  inputs:     [
    'clickOutBehavior: matEditLensClickOutBehavior',
    'preservedFormValue: matEditLensPreservedFormValue',
    'ignoreSubmitUnlessValid: matEditLensIgnoreSubmitUnlessValid'
  ],
  outputs:    [ 'preservedFormValueChange: matEditLensPreservedFormValueChange' ],
  providers:  [ EditRef ],
  standalone: true
})
export class MatEditLens<FormValue> extends CdkEditControl<FormValue> {
}

/** Reverts the form to its initial or previously submitted state on click. */
@Directive({
  selector:   'button[matEditRevert]',
  host:       {
    'type': 'button' // Prevents accidental form submits.
  },
  standalone: true
})
export class MatEditRevert<FormValue> extends CdkEditRevert<FormValue> {
}

/** Closes the lens on click. */
@Directive({
  selector:   '[matEditClose]',
  standalone: true
})
export class MatEditClose<FormValue> extends CdkEditClose<FormValue> {
}
