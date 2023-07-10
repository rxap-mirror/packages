import { NgModule } from '@angular/core';
import {
  AuthorizationService,
  PermissionMap,
} from './authorization.service';
import { AuthorizationDevelopmentService } from './authorization-development.service';
import { NgModuleWithProviders } from 'ng-mocks';
import { RXAP_GET_SYSTEM_ROLES_METHOD } from './tokens';
import { GetSystemRolesRemoteMethod } from './get-system-roles.remote-method';
import { ToMethod } from '@rxap/pattern';

export interface AuthorizationModuleOptions {
  /**
   * Enable the development mode
   * If enabled the AuthorizationDevelopmentService is used instead of the AuthorizationService
   */
  development?: boolean;
  rolesUrl?: string;
  roles?: PermissionMap;
}

@NgModule({})
export class AuthorizationModule {

  static forRoot(options: AuthorizationModuleOptions = {}): NgModuleWithProviders<AuthorizationModule> {
    const providers: NgModule['providers'] = [
      {
        provide: AuthorizationService,
        useClass: options.development ? AuthorizationDevelopmentService : AuthorizationService,
      },
    ];
    if (options.roles && options.rolesUrl) {
      throw new Error('You can only provide roles or rolesUrl as AuthorizationModuleOptions');
    }
    if (options.rolesUrl) {
      providers.push({
        provide: RXAP_GET_SYSTEM_ROLES_METHOD,
        useClass: GetSystemRolesRemoteMethod,
      });
    }
    if (options.roles) {
      providers.push({
        provide: RXAP_GET_SYSTEM_ROLES_METHOD,
        useValue: ToMethod(() => options.roles),
      });
    }
    return {
      ngModule: AuthorizationModule,
      providers,
    };
  }

}
