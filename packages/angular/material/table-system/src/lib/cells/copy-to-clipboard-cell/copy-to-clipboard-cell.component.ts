import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import {CopyToClipboardComponent} from '@rxap/components';
import {NgIf} from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-copy-to-clipboard-cell]',
  templateUrl: './copy-to-clipboard-cell.component.html',
  styleUrls: ['./copy-to-clipboard-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, CopyToClipboardComponent],
})
export class CopyToClipboardCellComponent {

  @Input('rxap-copy-to-clipboard-cell')
  public value: any;

}
