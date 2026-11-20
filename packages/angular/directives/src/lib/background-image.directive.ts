import { computed, Directive, effect, ElementRef, inject, input, Renderer2, untracked } from '@angular/core';
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
export class BackgroundImageDirective {
  private readonly host = inject<ElementRef>(ElementRef);
  private readonly renderer = inject<Renderer2>(Renderer2);
  private readonly imageLoader = inject<ImageLoaderService>(ImageLoaderService);

  public readonly imageUrl = input<string | null | undefined>(null, { alias: "rxapBackgroundImage" });

  public readonly placeholderImageUrl = input<string | null | undefined>();

  public readonly size = input<BackgroundSize | null | undefined>();

  public readonly repeat = input<BackgroundRepeat | null | undefined>();

  public readonly position = input<BackgroundPosition | null | undefined>();

  /**
   * The placeholder url that is used until the image is loaded. Derived
   * directives can override this to provide a fallback.
   */
  protected readonly placeholder = computed(() => this.placeholderImageUrl());

  constructor() {
    effect(() => {
      const size = this.size();
      untracked(() => this.sizeChange(size));
    });
    effect(() => {
      const position = this.position();
      untracked(() => this.positionChange(position));
    });
    effect(() => {
      const repeat = this.repeat();
      untracked(() => this.repeatChange(repeat));
    });
    effect(() => {
      const imageUrl = this.imageUrl();
      // the placeholder is tracked too, so it is applied as soon as it changes
      this.placeholder();
      // call unconditionally so clearing the value (null/empty) is handled
      untracked(() => this.imageUrlChange(imageUrl));
    });
  }

  private applyStyle(style: string, value: string | null | undefined): void {
    if (value) {
      this.renderer.setStyle(this.host.nativeElement, style, value);
    } else {
      this.renderer.removeStyle(this.host.nativeElement, style);
    }
  }

  private repeatChange(repeat: string | null | undefined): void {
    this.applyStyle('background-repeat', repeat);
  }

  private positionChange(position: string | null | undefined): void {
    this.applyStyle('background-position', position);
  }

  private sizeChange(size: string | null | undefined): void {
    this.applyStyle('background-size', size);
  }

  private _latestImageUrl: string | null | undefined;

  private async imageUrlChange(imageUrl: string | null | undefined): Promise<void> {
    // track the most recently requested url so out-of-order loads can be ignored
    this._latestImageUrl = imageUrl;
    const placeholderImageUrl = this.placeholder();
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
