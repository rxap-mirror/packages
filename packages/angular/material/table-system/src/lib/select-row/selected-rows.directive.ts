import { Directive, effect, TemplateRef, untracked, ViewContainerRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectRowService } from './select-row.service';
import { distinctUntilChanged } from 'rxjs/operators';

export interface SelectedRowsDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data[];
}

@Directive({
  selector: '[rxapSelectedRows]',
  standalone: true,
})
export class SelectedRowsDirective<Data extends Record<string, any>> {
  private readonly template = inject<TemplateRef<SelectedRowsDirectiveContext<Data>>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly selectRowService = inject<SelectRowService<Data>>(SelectRowService);

  private readonly selectedRows = toSignal(this.selectRowService.selectedRows$.pipe(distinctUntilChanged()));

  constructor() {
    effect(() => {
      const selectedRows = this.selectedRows();
      untracked(() => {
        this.viewContainerRef.clear();
        if (selectedRows) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: this.selectRowService.selectedRows });
        }
      });
    });
  }

}
