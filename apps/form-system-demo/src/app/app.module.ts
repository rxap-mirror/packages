import {
  BrowserModule,
  DomSanitizer
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegisterFormModule } from './user-register-form/user-register-form.module';
import { RxapFormSystemModule } from '@rxap/form-system';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { MatIconRegistry } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MonacoEditorModule.forRoot(),

    RxapFormSystemModule.forRoot(),
    RxapComponentSystemModule.forRoot(),

    UserRegisterFormModule,

    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg')
    );
  }

}
