import { NgModule } from '@angular/core';
import { SidenavContentComponent } from './sidenav-content.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ SidenavContentComponent ],
  imports:      [
    CommonModule,
    RouterModule
  ],
  exports:      [ SidenavContentComponent ]
})
export class SidenavContentModule {}
