import { NgModule } from '@angular/core';
import { ExpandControlsCellComponent } from './expand-controls-cell.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


@NgModule({
  declarations: [ ExpandControlsCellComponent ],
  imports:      [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports:      [ ExpandControlsCellComponent ]
})
export class ExpandControlsCellComponentModule {}
