import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  Input,
  Inject,
  OnDestroy,
  Optional
} from '@angular/core';
import { ui } from 'webix';
import {
  RXAP_DATA_SOURCE_TOKEN,
  IHttpDataSourceViewer
} from '@rxap/data-source';
import { Required } from '@rxap/utilities';
import * as uuid from 'uuid/v1';
import {
  RxapTableDefinition,
  RXAP_TABLE_SYSTEM_DEFINITION
} from '../definition/table-definition';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  TableDataSourceConnection,
  TableDataSource
} from '../table.data-source';
import { TableTemplateLoader } from '../table-template/table-template-loader';
import { TableActionHandler } from '../table-action.handler';

@Component({
  selector:        'rxap-webix-data-table',
  templateUrl:     './webix-data-table.component.html',
  styleUrls:       [ './webix-data-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebixDataTableComponent<Data> implements OnInit, OnDestroy {

  @ViewChild('container', { static: true }) public container!: ElementRef;
  @ViewChild('pagerContainer', { static: true }) public pagerContainer!: ElementRef;

  public ui!: ui.datatable;

  @Input() @Required public dataSource!: TableDataSource<Data, any>;
  @Input() public tableDefinition: RxapTableDefinition<Data> | null = null;

  @Input() public viewer: IHttpDataSourceViewer = { id: uuid() };

  public connection!: TableDataSourceConnection<Data>;

  public pageSize = 10;

  public subscriptions = new Subscription();

  constructor(
    public readonly tableTemplateLoader: TableTemplateLoader,
    public readonly tableActionHandler: TableActionHandler<Data>,
    @Optional() @Inject(RXAP_DATA_SOURCE_TOKEN) dataSource: any | null            = null,
    @Optional() @Inject(RXAP_TABLE_SYSTEM_DEFINITION) tableDefinition: any | null = null
  ) {
    if (dataSource) {
      this.dataSource = dataSource;
    }
    if (tableDefinition) {
      this.tableDefinition = tableDefinition;
    }
  }

  public ngOnInit() {
    this.viewer     = { id: this.tableDefinition ? this.tableDefinition.id : uuid() };
    this.connection = this.dataSource.connect(this.viewer);

    if (this.tableDefinition) {

      this.subscriptions.add(
        this.tableTemplateLoader
            .applyTemplate$(this.tableDefinition)
            .pipe(
              tap(() => this.buildTable())
            )
            .subscribe()
      );

    } else {
      this.buildTable();
    }

  }

  public buildTable() {
    if (this.ui) {
      this.ui.destructor();
    }
    this.ui = <ui.datatable>ui(this.buildTableConfig());

    if (this.tableDefinition) {
      this.subscriptions.add(
        this.tableDefinition.showColumn$.pipe(
          tap(key => this.ui.showColumn(key))
        ).subscribe()
      );

      this.subscriptions.add(
        this.tableDefinition.hideColumn$.pipe(
          tap(key => this.ui.hideColumn(key))
        ).subscribe()
      );
    }

    this.ui.resize();
  }

  public buildTableConfig() {
    const config: any = {
      container:  this.container.nativeElement,
      view:       'datatable',
      url:        {
        $proxy: true,
        load:   this.load.bind(this)
      },
      autoheight: true,
      datafetch:  6,
      loadahead:  0,
      pager:      {
        container: this.pagerContainer.nativeElement,
        size:      6,
        template:  ' {common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}'
      }
    };

    if (this.tableDefinition) {
      config.columns = this.tableDefinition.columns;
      config.onClick = this.tableDefinition.actions.reduce((onClick, action) => ({
        ...onClick,
        [ action.id ]: (_: any, { row }: { row: number }) => {
          this.tableActionHandler.handel(action, this.ui.data.getItem(row));
        }
      }), {} as any);
      // Object.assign(config, this.tableDefinition.__config);
    } else {
      config.autoConfig = true;
    }

    return config;
  }

  public ngOnDestroy() {
    this.ui.destructor();
    this.dataSource.disconnect(this.viewer);
    this.subscriptions.unsubscribe();
  }

  public load(view: any, params: any) {
    if (params && params.count) {
      this.connection.refresh({
        pageSize: params.count,
        page:     Math.floor(params.start / params.count) + 1,
        filters:  params.filter,
        sort:     params.sort ? { key: params.sort.id, direction: params.sort.dir } : null
      });
    }
    return this.connection.toPromise().then((response: any) => {
      return { data: response.data, pos: (response.page - 1) * response.data.length, total_count: response.total };
    });
  }

}
