import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormFieldIconButtonComponent } from './form-field-icon-button/form-field-icon-button.component';
import {
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { FormFieldClearButtonComponent } from './form-field-clear-button/form-field-clear-button.component';
import { FormFieldIconComponent } from './form-field-icon/form-field-icon.component';
import { FormFieldPrefixComponent } from './form-field-prefix/form-field-prefix.component';
import { FormFieldSuffixComponent } from './form-field-suffix/form-field-suffix.component';

@NgModule({
  declarations: [
    FormFieldIconButtonComponent,
    FormFieldClearButtonComponent,
    FormFieldIconComponent,
    FormFieldPrefixComponent,
    FormFieldSuffixComponent
  ],
  imports:      [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports:      [
    FormFieldIconButtonComponent,
    FormFieldClearButtonComponent,
    FormFieldIconComponent,
    FormFieldPrefixComponent,
    FormFieldSuffixComponent
  ]
})
export class FormFieldControlModule {}
