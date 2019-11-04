import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './paginator.component';
import { MatPaginatorModule } from '@angular/material';


@NgModule({
  declarations: [ PaginatorComponent ],
  imports:      [
    CommonModule,
    MatPaginatorModule
  ],
  exports:      [ PaginatorComponent ]
})
export class PaginatorComponentModule {}
