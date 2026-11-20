import { Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[rxapTableRowActionExecuting]',
  standalone: true,
})
export class TableRowActionExecutingDirective {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);


  public show(): void {
    this.vcr.createEmbeddedView(this.templateRef);
  }

  public hide(): void {
    this.vcr.clear();
  }
}
