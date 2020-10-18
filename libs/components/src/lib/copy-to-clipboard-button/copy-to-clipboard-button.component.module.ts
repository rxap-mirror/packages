import { NgModule } from '@angular/core';
import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [ CopyToClipboardButtonComponent ],
  imports:      [
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    MatSnackBarModule
  ],
  exports:      [ CopyToClipboardButtonComponent ]
})
export class CopyToClipboardButtonComponentModule {}
