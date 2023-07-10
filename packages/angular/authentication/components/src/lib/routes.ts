import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthenticationContainerComponent } from './authentication-container/authentication-container.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoadingComponent } from './loading/loading.component';
import { RxapAuthenticationGuard } from '@rxap/authentication';

export const AuthenticationRoutes: Routes = [
  {
    path: 'authentication',
    component: AuthenticationContainerComponent,
    children: [
      {
        canActivate: [ RxapAuthenticationGuard ],
        path: 'login',
        component: LoginComponent,
      },
      {
        canActivate: [RxapAuthenticationGuard],
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
];
