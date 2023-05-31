import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { LayoutComponent } from './layout.component';


import { NavigationWithInserts } from '../navigation/navigation-item';
import { RXAP_NAVIGATION_CONFIG } from '../tokens';

@NgModule({
  imports: [
    LayoutComponent
  ],
  exports: [ LayoutComponent ]
})
export class LayoutModule {

  public static withNavigation(navigation: NavigationWithInserts | (() => NavigationWithInserts)): ModuleWithProviders<LayoutModule> {

    return {
      ngModule:  LayoutModule,
      providers: [
        {
          provide:  RXAP_NAVIGATION_CONFIG,
          useValue: navigation
        }
      ]
    };
  }

}
