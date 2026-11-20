import { ChangeDetectorRef, DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectRowService } from './select-row.service';
import {
  distinctUntilChanged,
  map,
  tap,
} from 'rxjs/operators';
import { CdkTable } from '@angular/cdk/table';

export interface AllRowsSelectedDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data[];
}

@Directive({
  selector: '[rxapAllRowsSelected]',
  standalone: true,
})
export class AllRowsSelectedDirective<Data extends Record<string, any>> {
  private readonly template = inject<TemplateRef<AllRowsSelectedDirectiveContext<Data>>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly selectRowService = inject<SelectRowService<Data>>(SelectRowService);
  private readonly cdkTable = inject<CdkTable<Data>>(CdkTable);


  constructor() {
    this.selectRowService.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && selectedRows.length === this.cdkTable['_data']?.length),
      distinctUntilChanged(),
      tap(selectedAllRows => {
        this.viewContainerRef.clear();
        if (selectedAllRows) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: this.selectRowService.selectedRows });
        }
        this.cdr.detectChanges();
      }),
      takeUntilDestroyed(inject(DestroyRef)),
    ).subscribe();
  }

}
