import { Routes } from '@angular/router';
import { ContinueComponent } from './continue/continue.component';
import {
  ContainerComponent,
  LoadingComponent,
  ProfileResolve,
} from '@rxap/oauth';
import { OAuthSingleSignOnGuard } from './o-auth-single-sign-on.guard';
import { ErrorComponent } from './error/error.component';

export const RXAP_O_AUTH_SINGLE_SIGN_ON_ROUTES: Routes = [
  {
    path: '',
    component: ContainerComponent,
    children: [
      {
        path: 'continue',
        component: ContinueComponent,
        resolve: {
          profile: ProfileResolve,
        },
      },
      {
        path: 'error',
        component: ErrorComponent,
      },
      {
        path: '',
        canActivate: [OAuthSingleSignOnGuard],
        component: LoadingComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
