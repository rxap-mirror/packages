import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { HeaderService } from '../header.service';

@Directive({
  selector: '[rxapHeader]',
  standalone: true,
})
export class HeaderDirective implements OnInit, OnDestroy {
  private _portal?: TemplatePortal<void>;

  private readonly headerService = inject(HeaderService);
  private readonly template: TemplateRef<void> = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  public ngOnInit() {
    this._portal = new TemplatePortal<void>(
      this.template,
      this.viewContainerRef,
    );
    this.headerService.pushPortal(this._portal);
  }

  public ngOnDestroy() {
    if (this._portal) {
      this.headerService.removePortal(this._portal);
    }
  }
}


