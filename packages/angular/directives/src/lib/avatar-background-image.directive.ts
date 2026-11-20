import { Directive, ElementRef, Input, Renderer2, input, inject } from '@angular/core';
import {
  AvatarImageService,
  ImageLoaderService,
} from '@rxap/services';
import {
  BackgroundImageDirective,
  BackgroundRepeatOptions,
  BackgroundSizeOptions,
} from './background-image.directive';

@Directive({
  selector: '[rxapAvatarBackgroundImage]',
  standalone: true,
})
export class AvatarBackgroundImageDirective extends BackgroundImageDirective {
  private readonly avatarImage = inject<AvatarImageService>(AvatarImageService);

  public override readonly imageUrl = input<string | null | undefined>(null, { alias: "rxapAvatarBackgroundImage" });
  public override size = BackgroundSizeOptions.COVER;
  public override repeat = BackgroundRepeatOptions.NO_REPEAT;

  constructor() {
    const host = inject<ElementRef>(ElementRef);
    const renderer = inject<Renderer2>(Renderer2);
    const imageLoader = inject<ImageLoaderService>(ImageLoaderService);

    super(host, renderer, imageLoader);
  }

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set name(name: string) {
    if (!this.placeholderImageUrl()) {
      this.placeholderImageUrl = this.avatarImage.get({ name });
    }
  }
}


