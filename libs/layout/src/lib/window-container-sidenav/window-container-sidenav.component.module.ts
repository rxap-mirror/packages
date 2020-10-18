import { NgModule } from '@angular/core';
import { WindowContainerSidenavComponent } from './window-container-sidenav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';


@NgModule({
  declarations: [ WindowContainerSidenavComponent ],
  imports:      [
    FlexLayoutModule,
    CommonModule,
    PortalModule,
  ],
  exports:      [ WindowContainerSidenavComponent ],
})
export class WindowContainerSidenavModule {}
