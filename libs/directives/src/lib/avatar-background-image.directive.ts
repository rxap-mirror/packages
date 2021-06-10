import {
  NgModule,
  Directive,
  Input,
  ElementRef,
  Renderer2,
  Inject,
} from '@angular/core';
import {
  BackgroundImageDirective,
  BackgroundRepeatOptions,
  BackgroundSizeOptions,
} from './background-image.directive';
import { ImageLoaderService, AvatarImageService } from '@rxap/services';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapAvatarBackgroundImage]',
})
export class AvatarBackgroundImageDirective extends BackgroundImageDirective {
  @Input()
  public set name(name: string) {
    if (!this.placeholderImageUrl) {
      this.placeholderImageUrl = this.avatarImage.get({ name });
    }
  }

  @Input('rxapAvatarBackgroundImage')
  public imageUrl: string | null | undefined = null;

  public size = BackgroundSizeOptions.COVER;

  public repeat = BackgroundRepeatOptions.NO_REPEAT;

  constructor(
    @Inject(ElementRef)
    host: ElementRef,
    @Inject(Renderer2)
    renderer: Renderer2,
    @Inject(ImageLoaderService)
    imageLoader: ImageLoaderService,
    @Inject(AvatarImageService)
    private readonly avatarImage: AvatarImageService
  ) {
    super(host, renderer, imageLoader);
  }
}

@NgModule({
  declarations: [AvatarBackgroundImageDirective],
  exports: [AvatarBackgroundImageDirective],
})
export class AvatarBackgroundImageDirectiveModule {}
