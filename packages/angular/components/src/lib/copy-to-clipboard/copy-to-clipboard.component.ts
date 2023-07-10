import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import {Required} from '@rxap/utilities';
import {CopyToClipboardButtonComponent} from '../copy-to-clipboard-button/copy-to-clipboard-button.component';
import {NgIf} from '@angular/common';
import {FlexModule} from '@angular/flex-layout';

@Component({
  selector: 'rxap-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FlexModule, NgIf, CopyToClipboardButtonComponent],
})
export class CopyToClipboardComponent {

  @Input() public active = true;
  @Input() public disabled = false;
  @Input() @Required public value!: string;

}
