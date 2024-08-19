import {
  AfterViewInit,
  Directive,
  HostListener,
  Input,
  OnDestroy,
} from '@angular/core';
import { RxapFormGroup } from '@rxap/forms';
import { FormArrayItemButton } from './form-array-item-button';

// TODO : move to rxap packages
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
  @Input()
  public shouldTemporarilyDeleted: (formGroup: RxapFormGroup) => boolean = () => false;

  @HostListener('click')
  protected onClick() {
    const templateDelete = this.shouldTemporarilyDeleted(this.formGroup);
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
