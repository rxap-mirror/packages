import { Routes } from '@angular/router';
import { RxapAuthenticationGuard } from '@rxap/authentication';
import { AuthenticationContainerComponent } from './authentication-container/authentication-container.component';
import { LoadingComponent } from './loading/loading.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTHENTICATION_ROUTE: Routes = [
  {
    path: '',
    component: AuthenticationContainerComponent,
    children: [
      {
        canActivate: [ RxapAuthenticationGuard ],
        path: 'login',
        component: LoginComponent,
      },
      {
        canActivate: [ RxapAuthenticationGuard ],
        path: 'reset-password/:token',
        component: ResetPasswordComponent,
      },
      {
        path: 'loading',
        component: LoadingComponent,
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
