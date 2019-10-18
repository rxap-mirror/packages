import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { Type } from '@rxap/utilities';
import { ComponentRootModule } from './component-root.module';
import {
  ROOT_COMPONENTS,
  FEATURE_COMPONENTS
} from './tokens';
import { ComponentRegisterModule } from './component-register.module';

@NgModule()
export class RxapComponentSystemModule {

  public static forRoot(
    components: Array<Type<any>> = []
  ): ModuleWithProviders<ComponentRootModule> {
    return {
      ngModule:  ComponentRootModule,
      providers: [
        {
          provide:  ROOT_COMPONENTS,
          useValue: components
        }
      ]
    };
  }

  public static register(
    components: Array<Type<any>>
  ): ModuleWithProviders<ComponentRegisterModule> {
    return {
      ngModule:  ComponentRegisterModule,
      providers: [
        {
          provide:  FEATURE_COMPONENTS,
          multi:    true,
          useValue: components
        }
      ]
    };
  }

}
