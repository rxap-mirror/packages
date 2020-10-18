import {
  NgModule,
  ModuleWithProviders
} from '@angular/core';
import { LayoutComponent } from './layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FooterModule } from '../footer/footer.component.module';
import { HeaderModule } from '../header/header.component.module';
import { CommonModule } from '@angular/common';
import { SidenavModule } from '../sidenav/sidenav.component.module';
import { SidenavContentModule } from '../sidenav-content/sidenav-content.component.module';
import { NavigationWithInserts } from '../navigation/navigation-item';
import { RXAP_NAVIGATION_CONFIG } from '../tokens';
import { WindowContainerSidenavModule } from '../window-container-sidenav/window-container-sidenav.component.module';
import { ToggleWindowSidenavButtonModule } from '../toggle-window-sidenav-button/toggle-window-sidenav-button.component.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ LayoutComponent ],
  imports:      [
    MatSidenavModule,
    FooterModule,
    HeaderModule,
    CommonModule,
    SidenavModule,
    SidenavContentModule,
    WindowContainerSidenavModule,
    ToggleWindowSidenavButtonModule,
    FlexLayoutModule,
    RouterModule
  ],
  exports:      [ LayoutComponent ]
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
