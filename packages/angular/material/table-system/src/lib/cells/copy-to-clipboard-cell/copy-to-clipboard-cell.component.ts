import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CopyToClipboardComponent } from '@rxap/components';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-copy-to-clipboard-cell]',
    templateUrl: './copy-to-clipboard-cell.component.html',
    styleUrls: ['./copy-to-clipboard-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CopyToClipboardComponent]
})
export class CopyToClipboardCellComponent {

  @Input('rxap-copy-to-clipboard-cell')
  public value: any;

}
