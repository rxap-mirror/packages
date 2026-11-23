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
import { Showcase } from '@ng-prism/core';

@Showcase<ImageCellComponent>({
  title: 'Image Cell',
  category: 'Table System',
  description: 'Table cell that shows an image as background image of the cell content.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-image-cell></td></tr></table>' },
  variants: [
    { name: 'Cover', inputs: { value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%231e88e5'/><circle cx='30' cy='20' r='14' fill='white'/></svg>", size: 'cover' } },
    { name: 'Contain', inputs: { value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%231e88e5'/><circle cx='30' cy='20' r='14' fill='white'/></svg>", size: 'contain' } },
    { name: 'Circle', inputs: { value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%231e88e5'/><circle cx='30' cy='20' r='14' fill='white'/></svg>", preset: 'circle' } },
    { name: 'Rounded', inputs: { value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%231e88e5'/><circle cx='30' cy='20' r='14' fill='white'/></svg>", preset: 'rounded' } },
    { name: 'Empty', description: 'No image is rendered for an empty value.', inputs: { value: null } },
  ],
})
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
