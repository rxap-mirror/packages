import {
  AfterViewInit,
  Directive,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { FormArrayItemButton } from './form-array-item-button';

// TODO : move to rxap packages
@Directive({
  selector: 'button[rxapFormArrayItemRestoreButton]',
  standalone: true,
})
export class FormArrayItemRestoreButtonDirective extends FormArrayItemButton implements AfterViewInit, OnDestroy {

  @HostListener('click')
  override onClick() {
    this.formGroup.controls.deleted.setValue(false);
  }

  override updateDisplayStyle() {
    if (this.isDeleted) {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
    } else {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    }
  }

}
