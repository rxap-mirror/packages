import {
  Directive,
  NgModule,
  TemplateRef,
  ViewContainerRef,
  Input,
  Injector,
  OnDestroy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  NgZone,
  EmbeddedViewRef
} from '@angular/core';
import {
  DataSourceLoader,
  BaseDataSource,
  BaseDataSourceViewer
} from '@rxap/data-source';
import { Required } from '@rxap/utilities';
import {
  tap,
  take
} from 'rxjs/operators';
import {
  Observable,
  Subscription
} from 'rxjs';
import { IdOrInstanceOrToken } from '@rxap/definition';

export interface DataSourceTemplate<Data> {
  $implicit: Data;
  connection$: Observable<Data>;
}

@Directive({
  selector: '[rxapDataSource]',
  exportAs: 'rxapDataSource'
})
export class DataSourceDirective<Data = any> implements OnDestroy, OnChanges {

  @Input('rxapDataSourceFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<BaseDataSource<Data>>;

  @Input('rxapDataSourceViewer')
  public viewer!: BaseDataSourceViewer;

  public dataSource: BaseDataSource<Data> | null = null;

  public connection$!: Observable<Data>;

  protected readonly subscription = new Subscription();

  protected embeddedViewRef?: EmbeddedViewRef<DataSourceTemplate<Data>>;

  constructor(
    private readonly dataSourceLoader: DataSourceLoader,
    private readonly template: TemplateRef<DataSourceTemplate<Data>>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone
  ) {
    this.viewer = this;
  }

  public ngOnChanges(changes: SimpleChanges) {
    const dataSourceOrIdOrTokenChange = changes.dataSourceOrIdOrToken;
    if (dataSourceOrIdOrTokenChange) {
      this.dataSource = this.loadDataSource();
      this.connect();
    }
  }

  protected loadDataSource(): BaseDataSource<Data> | null {
    let dataSource: BaseDataSource | null = null;
    if (typeof this.dataSourceOrIdOrToken === 'string') {
      dataSource = this.dataSourceLoader.load<BaseDataSource<Data>>(this.dataSourceOrIdOrToken, undefined, this.injector);
    } else if (this.dataSourceOrIdOrToken instanceof BaseDataSource) {
      dataSource = this.dataSourceOrIdOrToken;
    } else if (this.dataSourceOrIdOrToken !== null) {
      dataSource = this.injector.get<BaseDataSource<Data>>(this.dataSourceOrIdOrToken);
    }
    return dataSource;
  }

  protected connect() {
    if (this.dataSource) {
      this.connection$ = this.dataSource
                             .connect(this.viewer);
      this.zone.onStable.pipe(
        take(1),
        tap(() => {
          this.zone.run(() => {
            this.subscription.add(this
              .connection$
              .pipe(tap(response => this.embedTemplate(response)))
              .subscribe());
          });
        })
      ).subscribe();

    }
  }

  public embedTemplate(response: any) {
    this.embeddedViewRef?.destroy();
    this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(this.template, {
      $implicit:   response,
      connection$: this.connection$
    });
    this.cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.dataSource?.disconnect(this.viewer);
    this.subscription.unsubscribe();
  }

}

@NgModule({
  exports:      [ DataSourceDirective ],
  declarations: [ DataSourceDirective ]
})
export class DataSourceDirectiveModule {

}
