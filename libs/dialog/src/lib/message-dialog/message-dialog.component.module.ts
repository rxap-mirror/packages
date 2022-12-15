import { NgModule } from '@angular/core';
import { MessageDialogComponent } from './message-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { MessageDialogService } from './message-dialog.service';
import { SantizationModule } from '@rxap/pipes/santization';


@NgModule({
  declarations: [
    MessageDialogComponent
  ],
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    SantizationModule
  ],
  exports:      [
    MessageDialogComponent
  ],
  providers:    [
    MessageDialogService
  ]
})
export class MessageDialogComponentModule {}
