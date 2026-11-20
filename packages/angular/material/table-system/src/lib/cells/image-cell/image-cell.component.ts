import {
  ChangeDetectionStrategy,
  Component,
  input
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
import { NgClass } from '@angular/common';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-image-cell]',
    templateUrl: './image-cell.component.html',
    styleUrls: ['./image-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, BackgroundImageDirective]
})
export class ImageCellComponent {

  public readonly preset = input<string>();

  public readonly size = input<BackgroundSize>(BackgroundSizeOptions.COVER);

  public readonly repeat = input<BackgroundRepeat>(BackgroundRepeatOptions.NO_REPEAT);

  public readonly position = input<BackgroundPosition>(BackgroundPositionOptions.CENTER_CENTER);

  public readonly value = input<string | null>(null, { alias: "rxap-image-cell" });

}
