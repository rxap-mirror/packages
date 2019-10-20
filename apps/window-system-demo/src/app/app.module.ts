import {
  BrowserModule,
  DomSanitizer
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RxapWindowSystemModule } from '@rxap/window-system';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ AppComponent ],
  imports:      [
    BrowserModule,
    BrowserAnimationsModule,
    RxapWindowSystemModule,
    HttpClientModule
  ],
  providers:    [],
  bootstrap:    [ AppComponent ]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg')
    );
  }
}
