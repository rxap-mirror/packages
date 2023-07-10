import {ChangeDetectorRef, Directive, Inject, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {SelectRowService} from './select-row.service';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {CdkTable} from '@angular/cdk/table';

export interface AllRowsSelectedDirectiveContext<Data extends Record<string, any>> {
  $implicit: Data[];
}

@Directive({
  selector: '[rxapAllRowsSelected]',
  standalone: true,
})
export class AllRowsSelectedDirective<Data extends Record<string, any>> implements OnInit, OnDestroy {

  private _subscription?: Subscription;

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<AllRowsSelectedDirectiveContext<Data>>,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Inject(SelectRowService)
    private readonly selectRowService: SelectRowService<Data>,
    @Inject(CdkTable)
    private readonly cdkTable: CdkTable<Data>,
  ) {
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    this._subscription = this.selectRowService.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && selectedRows.length === this.cdkTable['_data'].length),
      distinctUntilChanged(),
      tap(selectedAllRows => {
        this.viewContainerRef.clear();
        if (selectedAllRows) {
          this.viewContainerRef.createEmbeddedView(this.template, {$implicit: this.selectRowService.selectedRows});
        }
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

}
