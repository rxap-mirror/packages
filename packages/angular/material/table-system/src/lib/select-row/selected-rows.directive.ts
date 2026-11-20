import { ChangeDetectorRef, Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectRowService } from './select-row.service';
import {
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';

export interface SelectedRowsDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data[];
}

@Directive({
  selector: '[rxapSelectedRows]',
  standalone: true,
})
export class SelectedRowsDirective<Data extends Record<string, any>> implements OnInit, OnDestroy {
  private readonly template = inject<TemplateRef<SelectedRowsDirectiveContext<Data>>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private readonly selectRowService = inject<SelectRowService<Data>>(SelectRowService);


  private _subscription?: Subscription;

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    this._subscription = this.selectRowService.selectedRows$.pipe(
      distinctUntilChanged(),
      tap(selectedAllRows => {
        this.viewContainerRef.clear();
        if (selectedAllRows) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: this.selectRowService.selectedRows });
        }
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

}
