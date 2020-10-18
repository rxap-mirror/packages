import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';


@NgModule({
  declarations: [ FooterComponent ],
  imports:      [
    MatToolbarModule,
    CommonModule,
    PortalModule
  ],
  exports:      [ FooterComponent ]
})
export class FooterModule {}
