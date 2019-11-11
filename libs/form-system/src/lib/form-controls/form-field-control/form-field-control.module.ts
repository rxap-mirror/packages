import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { FormFieldClearButtonComponent } from './form-field-clear-button/form-field-clear-button.component';
import { FormFieldPrefixComponent } from './form-field-prefix/form-field-prefix.component';
import { FormFieldSuffixComponent } from './form-field-suffix/form-field-suffix.component';
import { IconComponentModule } from '../../utilities/icon/icon.component.module';
import { RxapIconButtonComponentModule } from '../../utilities/icon-button/icon-button-component.module';

@NgModule({
  declarations: [
    FormFieldClearButtonComponent,
    FormFieldPrefixComponent,
    FormFieldSuffixComponent
  ],
  imports:      [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IconComponentModule,
    RxapIconButtonComponentModule
  ],
  exports:      [
    FormFieldClearButtonComponent,
    FormFieldPrefixComponent,
    FormFieldSuffixComponent
  ]
})
export class FormFieldControlModule {}
