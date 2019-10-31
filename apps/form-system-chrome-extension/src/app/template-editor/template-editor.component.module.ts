import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateEditorComponent } from './template-editor.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatSlideToggleModule
} from '@angular/material';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ TemplateEditorComponent ],
  exports:      [
    TemplateEditorComponent
  ],
  imports:      [
    FlexLayoutModule,
    MatButtonModule,
    MatSlideToggleModule,
    MonacoEditorModule,
    CommonModule,
    FormsModule
  ]
})
export class TemplateEditorComponentModule {}
