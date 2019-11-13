import {
  Directive,
  ViewContainerRef,
  Input,
  OnInit
} from '@angular/core';
import { MatIcon } from '@angular/material';
import { IconConfig } from '@rxap/utilities';

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

  public matIcon!: MatIcon;
  @Input() public icon: string | IconConfig | null = null;

  constructor(public viewContainerRef: ViewContainerRef) {}

  public ngOnInit(): void {
    this.matIcon = (this.viewContainerRef as any)[ '_data' ].componentView.component;
    if (this.isSimpleIcon) {
      this.matIcon._elementRef.nativeElement.textContent = this.simpleIcon;
      this.matIcon.ngOnInit();
    } else {
      Object.assign(this.matIcon, this.complexIcon);
    }
  }

}


