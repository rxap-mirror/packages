import {
  ChangeDetectorRef,
  Directive,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
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

  private _subscription?: Subscription;

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<SelectedRowsDirectiveContext<Data>>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Inject(SelectRowService)
    private readonly selectRowService: SelectRowService<Data>,
  ) {
  }

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
