import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector:        'rxap-copy-to-clipboard-button',
  templateUrl:     './copy-to-clipboard-button.component.html',
  styleUrls:       [ './copy-to-clipboard-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-copy-to-clipboard-button' },
})
export class CopyToClipboardButtonComponent {
  @Input()
  public value: string | null = null;

  constructor(@Inject(MatSnackBar) private readonly snackbar: MatSnackBar) {}

  public copied() {
    this.snackbar.open('Erfolgreich in die Zwischenablage kopiert.', 'OK', { duration: 2500 });
  }

}
