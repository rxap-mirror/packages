import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  IconConfig,
  IsMaterialIcon,
  IsSvgIcon,
  NormalizedIconConfig,
  NormalizeIconConfig,
} from '@rxap/utilities';

@Directive({
  selector: 'mat-icon[rxapIcon]',
  standalone: true,
})
export class IconDirective {

  public readonly icon = input.required<IconConfig | null>({ alias: 'rxapIcon' });

  private readonly matIcon = inject(MatIcon);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const icon = this.icon();
      if (icon) {
        this.setIcon(NormalizeIconConfig(icon));
      } else {
        this.clearIcon();
      }
    });
  }

  private setIcon(icon: NormalizedIconConfig) {
    this.matIcon.color = icon.color;
    if (icon.inline !== undefined) {
      this.matIcon.inline = icon.inline;
    }
    if (icon.fontColor) {
      this.renderer.setStyle(
        this.elementRef.nativeElement,
        'color',
        icon.fontColor,
      );
    } else {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'color');
    }
    if (IsMaterialIcon(icon)) {
      this.matIcon._elementRef.nativeElement.textContent = icon.icon;
      this.matIcon.ngOnInit();
    } else if (IsSvgIcon(icon)) {
      if (icon.fontIcon) {
        this.matIcon.fontIcon = icon.fontIcon;
      }
      if (icon.fontSet) {
        this.matIcon.fontSet = icon.fontSet;
      }
      this.matIcon.svgIcon = icon.svgIcon;
    }
  }

  private clearIcon() {
    this.matIcon._elementRef.nativeElement.textContent = '';
    this.matIcon.fontIcon = '';
    this.matIcon.fontSet = '';
    this.matIcon.svgIcon = '';
    this.matIcon.ngOnInit();
  }

}


