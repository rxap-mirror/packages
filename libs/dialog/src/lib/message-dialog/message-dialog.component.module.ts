import { NgModule } from '@angular/core';
import { MessageDialogComponent } from './message-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MessageDialogService } from './message-dialog.service';


@NgModule({
  declarations: [
    MessageDialogComponent
  ],
  imports:      [
    MatDialogModule,
    MatButtonModule,
    CommonModule
  ],
  exports:      [
    MessageDialogComponent
  ],
  providers:    [
    MessageDialogService
  ]
})
export class MessageDialogComponentModule {}
