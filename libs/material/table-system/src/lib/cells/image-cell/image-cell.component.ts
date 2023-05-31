import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import {
  BackgroundPosition,
  BackgroundPositionOptions,
  BackgroundRepeat,
  BackgroundRepeatOptions,
  BackgroundSize,
  BackgroundSizeOptions,
  BackgroundImageDirective
} from '@rxap/directives';
import {
  NgIf,
  NgClass
} from '@angular/common';

@Component({
  selector:        'td[rxap-image-cell]',
  templateUrl:     './image-cell.component.html',
  styleUrls:       [ './image-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-image-cell' },
  standalone:      true,
  imports:         [ NgIf, NgClass, BackgroundImageDirective ]
})
export class ImageCellComponent {

  @Input()
  public preset?: string;

  @Input()
  public size: BackgroundSize = BackgroundSizeOptions.COVER;

  @Input()
  public repeat: BackgroundRepeat = BackgroundRepeatOptions.NO_REPEAT;

  @Input()
  public position: BackgroundPosition = BackgroundPositionOptions.CENTER_CENTER;

  @Input('rxap-image-cell')
  public value: string | null = null;

}
