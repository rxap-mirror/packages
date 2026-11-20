import {
  Directive,
  ElementRef,
  Inject,
  Input,
  Renderer2,
  input
} from '@angular/core';
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
  public override readonly imageUrl = input<string | null | undefined>(null, { alias: "rxapAvatarBackgroundImage" });
  public override size = BackgroundSizeOptions.COVER;
  public override repeat = BackgroundRepeatOptions.NO_REPEAT;

  constructor(
    @Inject(ElementRef)
      host: ElementRef,
    @Inject(Renderer2)
      renderer: Renderer2,
    @Inject(ImageLoaderService)
      imageLoader: ImageLoaderService,
    @Inject(AvatarImageService)
    private readonly avatarImage: AvatarImageService,
  ) {
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


