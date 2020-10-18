import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { Required } from '@rxap/utilities';

@Component({
  selector:        'rxap-copy-to-clipboard',
  templateUrl:     './copy-to-clipboard.component.html',
  styleUrls:       [ './copy-to-clipboard.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyToClipboardComponent {

  @Input() public active: boolean   = true;
  @Input() public disabled: boolean = false;
  @Input() @Required public value!: string;

}
