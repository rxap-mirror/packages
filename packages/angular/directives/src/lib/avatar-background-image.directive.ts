import {Directive, ElementRef, Inject, Input, Renderer2} from '@angular/core';
import {BackgroundImageDirective, BackgroundRepeatOptions, BackgroundSizeOptions} from './background-image.directive';
import {AvatarImageService, ImageLoaderService} from '@rxap/services';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapAvatarBackgroundImage]',
  standalone: true,
})
export class AvatarBackgroundImageDirective extends BackgroundImageDirective {
  @Input('rxapAvatarBackgroundImage')
  public override imageUrl: string | null | undefined = null;
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

  @Input()
  public set name(name: string) {
    if (!this.placeholderImageUrl) {
      this.placeholderImageUrl = this.avatarImage.get({name});
    }
  }
}


