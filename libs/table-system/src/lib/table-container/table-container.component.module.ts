import { NgModule } from '@angular/core';
import { TableContainerComponent } from './table-container.component';
import {
  MatCardModule,
  MatDividerModule,
  MatCheckboxModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { WebixDataTableModule } from '../webix-data-table/webix-data-table.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  exports:         [ TableContainerComponent ],
  declarations:    [ TableContainerComponent ],
  entryComponents: [ TableContainerComponent ],
  imports:         [
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule,
    MatMenuModule,
    TranslateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    WebixDataTableModule,
    FlexLayoutModule

  ]
})
export class TableContainerComponentModule {}
