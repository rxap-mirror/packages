import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormDetailsComponent } from './form-details.component';
import { MatTabsModule } from '@angular/material';
import { TemplateEditorComponentModule } from '../template-editor/template-editor.component.module';
import { FormInstanceComponentModule } from '../form-instance/form-instance.component.module';


@NgModule({
  declarations: [ FormDetailsComponent ],
  imports:      [
    CommonModule,
    MatTabsModule,
    TemplateEditorComponentModule,
    FormInstanceComponentModule
  ],
  exports:      [ FormDetailsComponent ]
})
export class FormDetailsComponentModule {}
