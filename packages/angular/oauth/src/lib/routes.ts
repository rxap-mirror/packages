import {Routes} from '@angular/router';
import {ContainerComponent} from './container/container.component';
import {LoadingComponent} from './loading/loading.component';
import {SignInWithRedirectComponent} from './sign-in-with-redirect/sign-in-with-redirect.component';
import {OAuthExtractGuard} from './o-auth-extract.guard';

export const RXAP_O_AUTH_ROUTES: Routes = [
  {
    path: 'oauth',
    component: ContainerComponent,
    children: [
      {
        path: 'redirect',
        component: SignInWithRedirectComponent,
      },
      {
        canActivate: [OAuthExtractGuard],
        path: '',
        component: LoadingComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
