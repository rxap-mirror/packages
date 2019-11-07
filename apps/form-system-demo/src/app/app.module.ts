import {
  BrowserModule,
  DomSanitizer
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegisterFormModule } from './user-register-form/user-register-form.module';
import {
  RxapFormSystemModule,
  RxapFormSystemDevToolModule
} from '@rxap/form-system';
import { RxapComponentSystemModule } from '@rxap/component-system';
import { MatIconRegistry } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserRegisterFormComponent } from './user-register-form/user-register-form.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    RouterModule.forRoot([
      {
        path:      '',
        component: UserRegisterFormComponent
      }
    ]),

    TranslateModule.forRoot(),

    RxapFormSystemModule.forRoot(),
    RxapComponentSystemModule.forRoot(),

    UserRegisterFormModule,

    RxapFormSystemDevToolModule,

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
