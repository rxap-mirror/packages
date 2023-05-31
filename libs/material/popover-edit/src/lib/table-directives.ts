/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive } from '@angular/core';
import {
  CdkEditOpen,
  CdkPopoverEdit,
  CdkPopoverEditTabOut,
  CdkRowHoverContent
} from './cdk/table-directives';
import { CELL_SELECTOR } from './cdk/constants';
import { closest } from './cdk/polyfill';

const POPOVER_EDIT_HOST_BINDINGS = {
  '[attr.tabindex]':      'disabled ? null : 0',
  'class':                'mat-popover-edit-cell',
  '[attr.aria-haspopup]': '!disabled'
};

const POPOVER_EDIT_INPUTS = [
  'template: matPopoverEdit',
  'context: matPopoverEditContext',
  'colspan: matPopoverEditColspan',
  'disabled: matPopoverEditDisabled'
];

const EDIT_PANE_CLASS = 'mat-edit-pane';

const MAT_ROW_HOVER_CLASS         = 'mat-row-hover-content';
const MAT_ROW_HOVER_RTL_CLASS     = MAT_ROW_HOVER_CLASS + '-rtl';
const MAT_ROW_HOVER_ANIMATE_CLASS = MAT_ROW_HOVER_CLASS + '-visible';
const MAT_ROW_HOVER_CELL_CLASS    = MAT_ROW_HOVER_CLASS + '-host-cell';

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector:   '[matPopoverEdit]:not([matPopoverEditTabOut])',
  host:       POPOVER_EDIT_HOST_BINDINGS,
  inputs:     POPOVER_EDIT_INPUTS,
  standalone: true
})
export class MatPopoverEdit<C> extends CdkPopoverEdit<C> {
  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }
}

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector:   '[matPopoverEdit][matPopoverEditTabOut]',
  host:       POPOVER_EDIT_HOST_BINDINGS,
  inputs:     POPOVER_EDIT_INPUTS,
  standalone: true
})
export class MatPopoverEditTabOut<C> extends CdkPopoverEditTabOut<C> {
  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }
}

/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
@Directive({
  selector:   '[matRowHoverContent]',
  standalone: true
})
export class MatRowHoverContent extends CdkRowHoverContent {
  protected initElement(element: HTMLElement) {
    super.initElement(element);
    element.classList.add(MAT_ROW_HOVER_CLASS);
  }

  protected makeElementHiddenButFocusable(element: HTMLElement): void {
    element.classList.remove(MAT_ROW_HOVER_ANIMATE_CLASS);
  }

  protected makeElementVisible(element: HTMLElement): void {
    closest(this.elementRef.nativeElement!, CELL_SELECTOR)!
      .classList.add(MAT_ROW_HOVER_CELL_CLASS);

    if (this.services.directionality.value === 'rtl') {
      element.classList.add(MAT_ROW_HOVER_RTL_CLASS);
    } else {
      element.classList.remove(MAT_ROW_HOVER_RTL_CLASS);
    }

    element.classList.remove(MAT_ROW_HOVER_ANIMATE_CLASS);
    this.services.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        element.classList.add(MAT_ROW_HOVER_ANIMATE_CLASS);
      });
    });
  }
}

/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
@Directive({
  selector:   '[matEditOpen]',
  standalone: true
})
export class MatEditOpen extends CdkEditOpen {
}
