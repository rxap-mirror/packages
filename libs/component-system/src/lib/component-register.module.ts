import {
  NgModule,
  Inject
} from '@angular/core';
import { FEATURE_COMPONENTS } from './tokens';
import { ComponentRootModule } from './component-root.module';

@NgModule()
export class ComponentRegisterModule {

  constructor(
    root: ComponentRootModule,
    @Inject(FEATURE_COMPONENTS) components: any[][]
  ) {
    components.forEach(groups => groups.forEach(rc => root.register(rc)));
  }

}
