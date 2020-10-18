import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  AuthenticationRoutes,
  RxapAuthenticationModule
} from '@rxap/authentication/components';
import { RxapAuthenticationGuard } from '@rxap/authentication';
import {
  LayoutComponent,
  LayoutModule
} from '@rxap/layout';

@NgModule({
  declarations: [ AppComponent ],
  imports:      [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      ...AuthenticationRoutes,
      {
        canActivate: [ RxapAuthenticationGuard ],
        path:        '',
        component:   LayoutComponent
      }
    ]),
    RxapAuthenticationModule,
    LayoutModule.withNavigation([
      {
        label: 'overview',
        routerLink: ['/'],
        icon: { icon: 'home' }
      }
    ])
  ],
  providers:    [],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
