import { NgModule } from '@angular/core';
import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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
