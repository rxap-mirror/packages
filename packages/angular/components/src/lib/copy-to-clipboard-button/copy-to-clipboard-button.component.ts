import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  input,
  Input,
} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { Showcase } from '@ng-prism/core';

@Showcase<CopyToClipboardButtonComponent>({
  title: 'Copy To Clipboard Button',
  category: 'Components',
  description: 'Icon button that copies the given value to the clipboard and confirms it with a snack bar.',
  status: 'stable',
  variants: [
    { name: 'Default', inputs: { value: 'npm install @rxap/components' } },
    { name: 'Empty value', description: 'Copies an empty string.' },
  ],
  states: [
    { name: 'Hover', pseudo: { hover: 'button' } },
    { name: 'Focus visible', pseudo: { 'focus-visible': 'button' } },
  ],
})
@Component({
    selector: 'rxap-copy-to-clipboard-button',
    templateUrl: './copy-to-clipboard-button.component.html',
    styleUrls: ['./copy-to-clipboard-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        ClipboardModule,
        MatIconModule,
        MatSnackBarModule,
    ]
})
export class CopyToClipboardButtonComponent {
  readonly value = input('');

  private readonly snackbar = inject(MatSnackBar);

  public copied() {
    this.snackbar.open($localize`Successfully copied to the clipboard.`, 'OK', {
      duration: 2500,
    });
  }
}
