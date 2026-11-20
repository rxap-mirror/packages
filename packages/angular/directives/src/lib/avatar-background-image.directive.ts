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
