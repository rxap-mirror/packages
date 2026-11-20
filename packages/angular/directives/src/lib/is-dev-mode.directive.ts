import { Directive, EmbeddedViewRef, isDevMode, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[rxapIsDevMode]',
  standalone: true,
})
export class IsDevModeDirective implements OnInit, OnDestroy {
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);


  private embeddedViewRef?: EmbeddedViewRef<unknown>;

  ngOnInit() {
    if (isDevMode()) {
      this.embeddedViewRef = this.vcr.createEmbeddedView(this.template);
    }
  }

  ngOnDestroy() {
    this.embeddedViewRef?.destroy();
    this.vcr.clear();
  }

}
