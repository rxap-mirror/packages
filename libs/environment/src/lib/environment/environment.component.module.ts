import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { EnvironmentComponent } from './environment.component';
import { Environment } from '../environment';
import { RXAP_ENVIRONMENT } from './tokens';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [EnvironmentComponent],
  imports: [
    CommonModule
  ],
  exports: [EnvironmentComponent]
})
export class EnvironmentComponentModule {

  public static set(environment: Environment): ModuleWithProviders<EnvironmentComponentModule> {
    return {
      ngModule: EnvironmentComponentModule,
      providers: [
        {
          provide: RXAP_ENVIRONMENT,
          useValue: environment,
        }
      ]
    }
  }

}
