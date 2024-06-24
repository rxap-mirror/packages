import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { FooterService } from '@rxap/services';

@Directive({
  selector: '[rxapFooter]',
  standalone: true,
})
export class FooterDirective implements OnInit, OnDestroy {
  private _portal?: TemplatePortal<void>;

  private readonly footerService = inject(FooterService);
  private readonly template: TemplateRef<void> = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

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


