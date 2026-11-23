import {
  AfterViewInit,
  Directive,
  OnDestroy,
  input,
} from '@angular/core';
import { RxapFormGroup } from '@rxap/forms';
import { FormArrayItemButton } from './form-array-item-button';
import { Showcase } from '@ng-prism/core';

// TODO : move to rxap packages
@Showcase({
  title: 'Form Array Item Remove Button',
  description: 'Removes the form group of the surrounding array item from the form array on click. With `shouldTemporarilyDeleted` the item is only marked as deleted and can be restored with the restore button.',
  status: 'stable',
  partOf: '[rxapFormArrayItemAddButton]',
})
@Directive({
  selector: 'button[rxapFormArrayItemRemoveButton]',
  standalone: true,
})
export class FormArrayItemRemoveButtonDirective extends FormArrayItemButton implements AfterViewInit, OnDestroy {

  /**
   * A function that returns if the control should be temporarily deleted.
   * true - in the given form group the deleted control is set to true
   * false - the form group is removed from the (parent) form array
   */
  public readonly shouldTemporarilyDeleted = input<(formGroup: RxapFormGroup) => boolean>(() => false);

  protected onClick() {
    const templateDelete = this.shouldTemporarilyDeleted()(this.formGroup);
    if (templateDelete) {
      this.deletedControl.setValue(true);
    } else {
      this.formArray.removeAt(this.index);
    }
  }

  protected updateDisplayStyle() {
    if (this.isDeleted) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    } else {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
    }
  }

}
