import { computed, Directive, inject, input } from '@angular/core';
import { AvatarImageService } from '@rxap/services';
import {
  BackgroundImageDirective,
  BackgroundPosition,
  BackgroundRepeat,
  BackgroundRepeatOptions,
  BackgroundSize,
  BackgroundSizeOptions,
} from './background-image.directive';
import { Showcase } from '@ng-prism/core';

@Showcase<AvatarBackgroundImageDirective>({
  title: 'Avatar Background Image',
  category: 'Directives',
  description: 'Extends the background image directive. If no placeholder image is provided, a placeholder avatar is generated from the given name.',
  status: 'stable',
  host: '<div style="width: 96px; height: 96px; border-radius: 50%">',
  variants: [
    { name: 'Generated from name', inputs: { name: 'Jane Doe' } },
    { name: 'Custom placeholder', inputs: { name: 'Jane Doe', placeholderImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%23bdbdbd'/></svg>" } },
    { name: 'Image', inputs: { imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40'><rect width='60' height='40' fill='%231e88e5'/><circle cx='30' cy='20' r='14' fill='white'/></svg>", name: 'Jane Doe' } },
  ],
})
@Directive({
  selector: '[rxapAvatarBackgroundImage]',
  standalone: true,
})
export class AvatarBackgroundImageDirective extends BackgroundImageDirective {
  private readonly avatarImage = inject<AvatarImageService>(AvatarImageService);

  public override readonly imageUrl = input<string | null | undefined>(null, { alias: 'rxapAvatarBackgroundImage' });

  public override readonly size = input<BackgroundSize | null | undefined>(BackgroundSizeOptions.COVER);

  public override readonly repeat = input<BackgroundRepeat | null | undefined>(BackgroundRepeatOptions.NO_REPEAT);

  public override readonly position = input<BackgroundPosition | null | undefined>();

  /**
   * The name used to generate a placeholder avatar if no explicit
   * placeholderImageUrl is provided.
   */
  public readonly name = input<string | null | undefined>();

  protected override readonly placeholder = computed(() => {
    const placeholderImageUrl = this.placeholderImageUrl();
    if (placeholderImageUrl) {
      return placeholderImageUrl;
    }
    const name = this.name();
    return name ? this.avatarImage.get({ name }) : undefined;
  });
}
