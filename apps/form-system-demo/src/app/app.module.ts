import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegisterFormModule } from './user-register-form/user-register-form.module';
import { RxapFormSystemModule } from '@rxap/form-system';

@NgModule({
  declarations: [ AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MonacoEditorModule.forRoot(),

    RxapFormSystemModule.forRoot(),

    UserRegisterFormModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
