import {
  Directive,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  NgModule
} from '@angular/core';
import { FooterService } from '@rxap/services';
import { TemplatePortal } from '@angular/cdk/portal';

@Directive({
  selector: '[rxapFooter]'
})
export class FooterDirective implements OnInit, OnDestroy {

  private _portal?: TemplatePortal<void>;

  constructor(
    private readonly footerService: FooterService,
    private readonly template: TemplateRef<void>,
    private readonly viewContainerRef: ViewContainerRef
  ) { }

  public ngOnInit() {
    this._portal = new TemplatePortal<void>(this.template, this.viewContainerRef);
    this.footerService.pushPortal(this._portal);
  }

  public ngOnDestroy() {
    if (this._portal) {
      this.footerService.removePortal(this._portal);
    }
  }

}

@NgModule({
  declarations: [ FooterDirective ],
  exports:      [ FooterDirective ]
})
export class FooterDirectiveModule {}
