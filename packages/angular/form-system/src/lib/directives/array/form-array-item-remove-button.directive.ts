import {
  AfterViewInit,
  Directive,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { FormArrayItemButton } from './form-array-item-button';

// TODO : move to rxap packages
@Directive({
  selector: 'button[rxapFormArrayItemRemoveButton]',
  standalone: true,
})
export class FormArrayItemRemoveButtonDirective extends FormArrayItemButton implements AfterViewInit, OnDestroy {

  @HostListener('click')
  protected onClick() {
    this.deletedControl.setValue(true);
  }

  protected updateDisplayStyle() {
    if (this.isDeleted) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    } else {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
    }
  }

}
