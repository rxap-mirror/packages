import { Directive, ElementRef, OnChanges, OnInit, Renderer2, SimpleChanges, input, inject } from '@angular/core';
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
  private readonly host = inject<ElementRef>(ElementRef);
  private readonly renderer = inject<Renderer2>(Renderer2);
  private readonly imageLoader = inject<ImageLoaderService>(ImageLoaderService);

  public readonly imageUrl = input<string | null | undefined>(null, { alias: "rxapBackgroundImage" });

  public readonly placeholderImageUrl = input.required<string>();

  public readonly size = input<BackgroundSize>();

  public readonly repeat = input<BackgroundRepeat>();

  public readonly position = input<BackgroundPosition>();

  public ngOnInit() {
    const size = this.size();
    if (size) {
      this.sizeChange(size);
    }
    const position = this.position();
    if (position) {
      this.positionChange(position);
    }
    const repeat = this.repeat();
    if (repeat) {
      this.repeatChange(repeat);
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
    const placeholderImageUrl = this.placeholderImageUrl();
    if (placeholderImageUrl) {
      this.renderer.setStyle(
        this.host.nativeElement,
        'background-image',
        `url("${ placeholderImageUrl }")`,
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
    } else if (!placeholderImageUrl) {
      // clearing the image and no placeholder to fall back to
      this.renderer.removeStyle(this.host.nativeElement, 'background-image');
    }
  }
}


