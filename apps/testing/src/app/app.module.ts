import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RxapAuthenticationModule } from '@rxap/authentication/components';
import {
  LayoutComponent,
  LayoutModule
} from '@rxap/layout';
import { IconModule } from '@rxap/icon';
import { RXAP_AUTHENTICATION_DEACTIVATED } from '@rxap/authentication';

@NgModule({
  declarations: [ AppComponent ],
  imports:      [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      // ...AuthenticationRoutes,
      {
        // canActivate: [ RxapAuthenticationGuard ],
        path:      '',
        component: LayoutComponent,
        children: [
          {
            path:         'authorization',
            loadChildren: () => import('./feature/authorization/feature-authorization.module').then(m => m.FeatureAuthorizationModule)
          },
          {
            path:       '**',
            redirectTo: 'authorization'
          }
        ]
      }
    ]),
    IconModule,
    RxapAuthenticationModule,
    LayoutModule.withNavigation([
      {
        label:      'Authorization',
        routerLink: [ '/', 'authorization' ],
        icon:       { icon: 'lock' }
      }
    ])
  ],
  providers:    [
    {
      provide:  RXAP_AUTHENTICATION_DEACTIVATED,
      useValue: true
    }
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule {}
