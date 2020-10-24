import { NgModule } from '@angular/core';
import { SidenavComponent } from './sidenav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NavigationComponentModule } from '../navigation/navigation.component.module';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { SidenavHeaderDirective } from './sidenav-header.directive';
import { SidenavFooterDirective } from './sidenav-footer.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ SidenavComponent, SidenavHeaderDirective, SidenavFooterDirective ],
  imports:      [
    FlexLayoutModule,
    NavigationComponentModule,
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  exports:      [ SidenavComponent, SidenavHeaderDirective, SidenavFooterDirective ],
})
export class SidenavModule {}
