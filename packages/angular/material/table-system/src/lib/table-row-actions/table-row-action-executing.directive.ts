import {
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[rxapTableRowActionExecuting]',
  standalone: true,
})
export class TableRowActionExecutingDirective {
  constructor(
    public readonly templateRef: TemplateRef<void>,
    private readonly vcr: ViewContainerRef,
  ) {
  }

  public show(): void {
    this.vcr.createEmbeddedView(this.templateRef);
  }

  public hide(): void {
    this.vcr.clear();
  }
}
