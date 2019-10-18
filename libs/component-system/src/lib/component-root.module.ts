import {
  NgModule,
  Inject,
  Type
} from '@angular/core';
import { ComponentRegistryService } from './component-registry.service';
import { ROOT_COMPONENTS } from './tokens';

@NgModule()
export class ComponentRootModule {

  constructor(
    private componentRegistry: ComponentRegistryService,
    @Inject(ROOT_COMPONENTS) rootComponents: Array<Type<any>>
  ) {
    rootComponents.forEach(rc => this.register(rc));
  }

  public register(component: Type<any>) {
    this.componentRegistry.register(component);
  }

}
