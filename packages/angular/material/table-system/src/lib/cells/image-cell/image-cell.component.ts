import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import {
  BackgroundImageDirective,
  BackgroundPosition,
  BackgroundPositionOptions,
  BackgroundRepeat,
  BackgroundRepeatOptions,
  BackgroundSize,
  BackgroundSizeOptions,
} from '@rxap/directives';
import {
  NgClass,
  NgIf,
} from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-image-cell]',
  templateUrl: './image-cell.component.html',
  styleUrls: ['./image-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgClass, BackgroundImageDirective],
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
