import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CopyToClipboardButtonComponent } from '../copy-to-clipboard-button/copy-to-clipboard-button.component';

@Component({
  selector: 'rxap-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: [ './copy-to-clipboard.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ NgIf, CopyToClipboardButtonComponent ],
})
export class CopyToClipboardComponent {

  @Input() public active = true;
  @Input() public disabled = false;
  @Input({ required: true }) public value!: string;

}
