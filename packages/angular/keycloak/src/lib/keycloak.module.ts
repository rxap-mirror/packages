import { NgModule } from '@angular/core';
import { KeycloakService } from './services/keycloak.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakBearerInterceptor } from './interceptors/keycloak-bearer.interceptor';

@NgModule({
  providers: [
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true,
    },
  ],
})
export class KeycloakModule {
}
