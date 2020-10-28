import { NgModule } from '@angular/core';
import { ExpandRowContainerComponentModule } from './expand-row-container/expand-row-container.component.module';
import { ExpandControlsCellComponentModule } from './expand-controls-cell/expand-controls-cell.component.module';
import { ExpandRowService } from './expand-row.service';
import { ExpandRowDirective } from './expand-row.directive';

@NgModule({
  exports:      [
    ExpandRowContainerComponentModule,
    ExpandControlsCellComponentModule,
    ExpandRowDirective
  ],
  providers:    [
    ExpandRowService
  ],
  declarations: [ ExpandRowDirective ]
})
export class ExpandRowModule {}
