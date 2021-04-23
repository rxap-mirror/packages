import {
  Component,
  ChangeDetectionStrategy, Input,
} from '@angular/core';

@Component({
  selector:        'td[rxap-copy-to-clipboard-cell]',
  templateUrl:     './copy-to-clipboard-cell.component.html',
  styleUrls:       [ './copy-to-clipboard-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-copy-to-clipboard-cell' }
})
export class CopyToClipboardCellComponent {

  @Input('rxap-copy-to-clipboard-cell')
  public value: any;

}
