import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormDetailsComponent } from './form-details.component';
import { MatTabsModule } from '@angular/material';
import { TemplateEditorComponentModule } from '../template-editor/template-editor.component.module';
import { FormInstancesComponentModule } from '../form-instances/form-instances.component.module';


@NgModule({
  declarations: [ FormDetailsComponent ],
  imports:      [
    CommonModule,
    MatTabsModule,
    TemplateEditorComponentModule,
    FormInstancesComponentModule
  ],
  exports:      [ FormDetailsComponent ]
})
export class FormDetailsComponentModule {}
