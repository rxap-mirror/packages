import {
  Directive,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  Inject,
} from '@angular/core';
import {FooterService} from '@rxap/services';
import {TemplatePortal} from '@angular/cdk/portal';

@Directive({
  selector: '[rxapFooter]',
  standalone: true,
})
export class FooterDirective implements OnInit, OnDestroy {
  private _portal?: TemplatePortal<void>;

  constructor(
    @Inject(FooterService)
    private readonly footerService: FooterService,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<void>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
  ) {
  }

  public ngOnInit() {
    this._portal = new TemplatePortal<void>(
      this.template,
      this.viewContainerRef,
    );
    this.footerService.pushPortal(this._portal);
  }

  public ngOnDestroy() {
    if (this._portal) {
      this.footerService.removePortal(this._portal);
    }
  }
}


