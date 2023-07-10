import { ChangeDetectionStrategy, Component, Inject, Input } from "@angular/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'rxap-copy-to-clipboard-button',
  templateUrl: './copy-to-clipboard-button.component.html',
  styleUrls: ['./copy-to-clipboard-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    ClipboardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
})
export class CopyToClipboardButtonComponent {
  @Input()
  public value = '';

  constructor(@Inject(MatSnackBar) private readonly snackbar: MatSnackBar) {
  }

  public copied() {
    this.snackbar.open('Erfolgreich in die Zwischenablage kopiert.', 'OK', {
      duration: 2500,
    });
  }
}
