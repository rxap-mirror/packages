import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';
import { SantizationModule } from '@rxap/pipes/santization';


@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    SantizationModule
  ],
  exports: [ConfirmDialogComponent],
  providers: [ConfirmDialogService]
})
export class ConfirmDialogComponentModule { }
