import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
