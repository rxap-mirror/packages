import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { CopyToClipboardComponent } from '@rxap/components';
import { Showcase } from '@ng-prism/core';


@Showcase<CopyToClipboardCellComponent>({
  title: 'Copy To Clipboard Cell',
  category: 'Table System',
  description: 'Table cell that shows a button to copy the cell value to the clipboard. The button is hidden for empty values.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-copy-to-clipboard-cell></td></tr></table>' },
  variants: [
    { name: 'Text', inputs: { value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' } },
    { name: 'Number', inputs: { value: 42 } },
    { name: 'Empty', description: 'The copy button is hidden for an empty value.', inputs: { value: '' } },
  ],
})
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
