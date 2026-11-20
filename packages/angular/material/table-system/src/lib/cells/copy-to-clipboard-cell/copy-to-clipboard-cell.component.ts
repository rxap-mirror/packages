import {
  ChangeDetectionStrategy,
  Component,
  input
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

  public readonly value = input<any>(undefined, { alias: "rxap-copy-to-clipboard-cell" });

}
