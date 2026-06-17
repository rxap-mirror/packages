import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { ImageLoaderService } from '@rxap/services';

export enum GlobalStyleOptions {
  INITIAL = 'initial',
  INHERIT = 'inherit',
}

// TODO : complete description
// https://www.w3schools.com/cssref/css3_pr_background-size.asp
export enum BackgroundSizeOptions {
  AUTO = 'auto',
  COVER = 'cover',
  CONTAIN = 'contain',
}

export type BackgroundSize =
  | GlobalStyleOptions
  | BackgroundSizeOptions
  | string;

// TODO : complete options and description
// https://www.w3schools.com/cssref/pr_background-repeat.asp
export enum BackgroundRepeatOptions {
  NO_REPEAT = 'no-repeat',
}

export type BackgroundRepeat = GlobalStyleOptions | BackgroundRepeatOptions;

// TODO : complete options and description
// https://www.w3schools.com/cssref/pr_background-position.asp
export enum BackgroundPositionOptions {
  CENTER = 'center',
  CENTER_CENTER = 'center center',
}

export type BackgroundPosition =
  | GlobalStyleOptions
  | BackgroundPositionOptions
  | string;

@Directive({
  selector: '[rxapBackgroundImage]',
  standalone: true,
})
export class BackgroundImageDirective implements OnChanges, OnInit {
  @Input('rxapBackgroundImage')
  public imageUrl: string | null | undefined = null;

  @Input()
  public placeholderImageUrl!: string;

  @Input()
  public size?: BackgroundSize;

  @Input()
  public repeat?: BackgroundRepeat;

  @Input()
  public position?: BackgroundPosition;

  // TODO : add inputs for all 'background-*' styles

  constructor(
    @Inject(ElementRef)
    private readonly host: ElementRef,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(ImageLoaderService)
    private readonly imageLoader: ImageLoaderService,
  ) {
  }

  public ngOnInit() {
    if (this.size) {
      this.sizeChange(this.size);
    }
    if (this.position) {
      this.positionChange(this.position);
    }
    if (this.repeat) {
      this.repeatChange(this.repeat);
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propertyKey of Object.keys(changes)) {
      switch (propertyKey) {
        case 'imageUrl':
          // call unconditionally so clearing the value (null/empty) is handled
          this.imageUrlChange(changes['imageUrl'].currentValue);
          break;

        case 'size':
          this.sizeChange(changes['size'].currentValue);
          break;

        case 'repeat':
          this.repeatChange(changes['repeat'].currentValue);
          break;

        case 'position':
          this.positionChange(changes['position'].currentValue);
          break;
      }
    }
  }

  private repeatChange(repeat: string): void {
    this.renderer.setStyle(
      this.host.nativeElement,
      'background-repeat',
      repeat,
    );
  }

  private positionChange(position: string): void {
    this.renderer.setStyle(
      this.host.nativeElement,
      'background-position',
      position,
    );
  }

  private sizeChange(size: string): void {
    this.renderer.setStyle(this.host.nativeElement, 'background-size', size);
  }

  private _latestImageUrl: string | null | undefined;

  private async imageUrlChange(imageUrl: string | null | undefined): Promise<void> {
    // track the most recently requested url so out-of-order loads can be ignored
    this._latestImageUrl = imageUrl;
    if (this.placeholderImageUrl) {
      this.renderer.setStyle(
        this.host.nativeElement,
        'background-image',
        `url("${ this.placeholderImageUrl }")`,
      );
    }
    if (imageUrl) {
      await this.imageLoader.load(imageUrl);
      // a newer imageUrl was requested while this one was loading - drop the stale result
      if (this._latestImageUrl !== imageUrl) {
        return;
      }
      this.renderer.setStyle(
        this.host.nativeElement,
        'background-image',
        `url("${ imageUrl }")`,
      );
    } else if (!this.placeholderImageUrl) {
      // clearing the image and no placeholder to fall back to
      this.renderer.removeStyle(this.host.nativeElement, 'background-image');
    }
  }
}


