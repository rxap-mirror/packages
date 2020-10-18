import {
  Directive,
  Input,
  Inject,
  OnInit,
  Renderer2,
  ElementRef,
  NgModule
} from '@angular/core';
import {
  IconConfig,
  IsMaterialIcon,
  IsSvgIcon
} from '@rxap/utilities';
import { MatIcon } from '@angular/material/icon';

@Directive({
  selector: 'mat-icon[rxapIcon]'
})
export class IconDirective implements OnInit {

  public get isSimpleIcon(): boolean {
    return typeof this.icon === 'string';
  }

  public get complexIcon(): IconConfig {
    return this.icon as any;
  }

  public get simpleIcon(): string {
    return this.icon as any;
  }

  @Input('rxapIcon') public icon?: IconConfig;

  constructor(
    @Inject(MatIcon)
    private readonly matIcon: MatIcon,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef
  ) {}

  public ngOnInit(): void {
    if (this.isSimpleIcon) {
      this.matIcon._elementRef.nativeElement.textContent = this.simpleIcon;
      this.matIcon.ngOnInit();
    } else {
      const icon         = this.complexIcon;
      this.matIcon.color = icon.color;
      if (icon.inline !== undefined) {
        this.matIcon.inline = icon.inline;
      }
      if (icon.fontColor) {
        this.renderer.setStyle(this.elementRef.nativeElement, 'color', icon.fontColor);
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
        const previousValue  = this.matIcon.svgIcon;
        this.matIcon.svgIcon = icon.svgIcon;
        this.matIcon.ngOnChanges({ svgIcon: { previousValue } as any });
      }
    }
  }

}

@NgModule({
  exports:      [ IconDirective ],
  declarations: [ IconDirective ]
})
export class IconDirectiveModule {}
