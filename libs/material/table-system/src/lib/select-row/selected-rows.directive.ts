import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
  Input,
  Optional
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectRowService } from './select-row.service';
import {
  map,
  tap,
  distinctUntilChanged
} from 'rxjs/operators';
import { CdkTable } from '@angular/cdk/table';
import { MatTable } from '@angular/material/table';

export interface SelectedRowsDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data[];
}

@Directive({
  selector: '[rxapSelectedRows]'
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
    private readonly selectRowService: SelectRowService<Data>
  ) {}

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
      })
    ).subscribe();
  }

}
