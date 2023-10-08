import {
  Directive,
  EmbeddedViewRef,
  isDevMode,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[rxapIsDevMode]',
  standalone: true,
})
export class IsDevModeDirective implements OnInit, OnDestroy {

  private embeddedViewRef?: EmbeddedViewRef<unknown>;

  constructor(
    private readonly template: TemplateRef<unknown>,
    private readonly vcr: ViewContainerRef,
  ) {}

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
