import { NgModule } from '@angular/core';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CopyToClipboardButtonComponentModule } from '../copy-to-clipboard-button/copy-to-clipboard-button.component.module';


@NgModule({
  declarations: [ CopyToClipboardComponent ],
  imports:      [
    FlexLayoutModule,
    ClipboardModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    CopyToClipboardButtonComponentModule,
  ],
  exports:      [ CopyToClipboardComponent ]
})
export class CopyToClipboardModule {}
