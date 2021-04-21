import { Routes } from '@angular/router';
import { ContinueComponent } from './continue/continue.component';
import {
  ProfileResolve,
  ContainerComponent,
  LoadingComponent
} from '@rxap/oauth';
import { OAuthSingleSignOnGuard } from './o-auth-single-sign-on.guard';

export const RXAP_O_AUTH_SINGLE_SIGN_ON_ROUTES: Routes = [
  {
    path:      '',
    component: ContainerComponent,
    children:  [
      {
        path:      'continue',
        component: ContinueComponent,
        resolve:   {
          profile: ProfileResolve
        }
      },
      {
        path:        '',
        canActivate: [ OAuthSingleSignOnGuard ],
        component:   LoadingComponent
      },
      {
        path:       '**',
        redirectTo: ''
      }
    ]
  }
];
