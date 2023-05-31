import {
  Directive,
  Input,
  Inject,
  Renderer2,
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  IconConfig,
  IsMaterialIcon,
  IsSvgIcon
} from '@rxap/utilities';
import { MatIcon } from '@angular/material/icon';

@Directive({
  selector:   'mat-icon[rxapIcon]',
  standalone: true
})
export class IconDirective implements OnChanges {
  public get isSimpleIcon(): boolean {
    return typeof this.icon === 'string';
  }

  public get complexIcon(): IconConfig | null {
    return this.icon as any;
  }

  public get simpleIcon(): string {
    return this.icon as any;
  }

  @Input('rxapIcon') public icon?: IconConfig | null;

  constructor(
    @Inject(MatIcon)
    private readonly matIcon: MatIcon,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.icon) {
      this.updateIcon();
    }
  }

  public updateIcon(): void {
    if (this.isSimpleIcon) {
      this.matIcon._elementRef.nativeElement.textContent = this.simpleIcon;
      this.matIcon.ngOnInit();
    } else {
      const icon = this.complexIcon;
      if (icon) {
        this.matIcon.color = icon.color;
        if (icon.inline !== undefined) {
          this.matIcon.inline = icon.inline;
        }
        if (icon.fontColor) {
          this.renderer.setStyle(
            this.elementRef.nativeElement,
            'color',
            icon.fontColor
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
    }
  }
}


