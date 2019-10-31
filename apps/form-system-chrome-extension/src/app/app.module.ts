import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatToolbarModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormDetailsComponentModule } from './form-details/form-details.component.module';

@NgModule({
  declarations: [ AppComponent ],
  imports:      [
    BrowserModule,
    BrowserAnimationsModule,
    MonacoEditorModule.forRoot(),
    MatToolbarModule,
    MatSelectModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    FormDetailsComponentModule
  ],
  providers:    [],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
