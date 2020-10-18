import {
  NgModule,
  Directive,
  Input,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  BackgroundImageDirective,
  BackgroundRepeatOptions,
  BackgroundSizeOptions
} from './background-image.directive';
import {
  ImageLoaderService,
  AvatarImageService
} from '@rxap/services';
import { Required } from '@rxap/utilities';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapAvatarBackgroundImage]'
})
export class AvatarBackgroundImageDirective extends BackgroundImageDirective {

  @Input()
  public set name(name: string) {
    if (!this.placeholderImageUrl) {
      this.placeholderImageUrl = this.avatarImage.get({ name });
    }
  }

  @Input('rxapAvatarBackgroundImage')
  @Required
  public imageUrl!: string;

  public size = BackgroundSizeOptions.COVER;

  public repeat = BackgroundRepeatOptions.NO_REPEAT;

  constructor(
    host: ElementRef,
    renderer: Renderer2,
    imageLoader: ImageLoaderService,
    private readonly avatarImage: AvatarImageService
  ) {
    super(host, renderer, imageLoader);
  }

}

@NgModule({
  declarations: [ AvatarBackgroundImageDirective ],
  exports:      [ AvatarBackgroundImageDirective ]
})
export class AvatarBackgroundImageDirectiveModule {}
