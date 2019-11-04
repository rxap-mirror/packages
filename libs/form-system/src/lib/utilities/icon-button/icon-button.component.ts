import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';

@Component({
  selector:        'rxap-icon-button',
  templateUrl:     './icon-button.component.html',
  styleUrls:       [ './icon-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation:   ViewEncapsulation.None
})
export class IconButtonComponent {

  @Input() public show = true;

  @Input() public icon: string | IconConfig | null = null;

  @Output() public buttonClick = new EventEmitter<void>();

}
