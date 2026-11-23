import {
  AfterViewInit,
  Directive,
  OnDestroy,
} from '@angular/core';
import { FormArrayItemButton } from './form-array-item-button';
import { Showcase } from '@ng-prism/core';

// TODO : move to rxap packages
@Showcase({
  title: 'Form Array Item Restore Button',
  description: 'Restores an array item that was temporarily deleted with the remove button. The button is only visible for deleted items.',
  status: 'stable',
  partOf: '[rxapFormArrayItemAddButton]',
})
@Directive({
  selector: 'button[rxapFormArrayItemRestoreButton]',
  standalone: true,
})
export class FormArrayItemRestoreButtonDirective extends FormArrayItemButton implements AfterViewInit, OnDestroy {

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
