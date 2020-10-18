import { NgModule } from '@angular/core';
import { ExpandRowContainerComponent } from './expand-row-container.component';
import { ExpandRowContentDirective } from './expand-row-content.directive';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    ExpandRowContainerComponent,
    ExpandRowContentDirective
  ],
  imports: [
    PortalModule,
    CommonModule
  ],
  exports:      [
    ExpandRowContainerComponent,
    ExpandRowContentDirective
  ]
})
export class ExpandRowContainerComponentModule {}
