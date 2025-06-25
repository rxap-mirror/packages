import {
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CopyToClipboardButtonComponent } from '../copy-to-clipboard-button/copy-to-clipboard-button.component';

@Component({
    selector: 'rxap-copy-to-clipboard',
    templateUrl: './copy-to-clipboard.component.html',
    styleUrls: ['./copy-to-clipboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ CopyToClipboardButtonComponent, NgClass ],
})
export class CopyToClipboardComponent {

  readonly active = input(true);
  readonly disabled = input(false);
  readonly value = input.required<string>();

  readonly containerClass = input<string>('flex flex-row gap-2');

  readonly position = input<'before' | 'after'>('before');

  readonly isPositionBefore = computed(() => this.position() === 'before');
  readonly isPositionAfter = computed(() => this.position() === 'after');

}
