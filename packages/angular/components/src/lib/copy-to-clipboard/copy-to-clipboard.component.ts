import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CopyToClipboardButtonComponent } from '../copy-to-clipboard-button/copy-to-clipboard-button.component';
import { Showcase } from '@ng-prism/core';

@Showcase<CopyToClipboardComponent>({
  title: 'Copy To Clipboard',
  category: 'Components',
  description: 'Shows the projected content or the value next to a button that copies the value to the clipboard.',
  status: 'stable',
  variants: [
    { name: 'Default', description: 'Without projected content the value is shown.', inputs: { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' } },
    { name: 'With content', description: 'The projected content replaces the displayed value.', inputs: { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }, content: 'Copy the id' },
    { name: 'Button after', inputs: { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', position: 'after' } },
    { name: 'Inactive', description: 'The copy button is hidden.', inputs: { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', active: false } },
  ],
})
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
