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

@Component({
  selector:        'rxap-webix-data-table',
  templateUrl:     './webix-data-table.component.html',
  styleUrls:       [ './webix-data-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebixDataTableComponent<Data> implements OnInit, OnDestroy {

  @ViewChild('container', { static: true }) public container!: ElementRef;

  public ui!: ui.datatable;

  @Input() @Required public dataSource!: TableDataSource<Data, any>;
  @Input() public tableDefinition: RxapTableDefinition<Data> | null = null;

  @Input() public viewer: IHttpDataSourceViewer = { id: uuid() };

  @Input() public height = 500;

  public connection!: TableDataSourceConnection<Data>;

  public subscriptions = new Subscription();

  constructor(
    public readonly tableTemplateLoader: TableTemplateLoader,
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
    this.viewer     = { id: this.tableDefinition ? this.tableDefinition.tableId : uuid() };
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
    this.ui.resize();
  }

  public buildTableConfig() {
    const config: any = {
      container: this.container.nativeElement,
      view:      'datatable',
      url:       {
        $proxy: true,
        load:   this.load.bind(this)
      },
      height:    this.height
    };

    if (this.tableDefinition) {
      config.columns = this.tableDefinition.columns;
      config.onClick = this.tableDefinition.actions.reduce((onClick, action) => ({
        ...onClick,
        [ action.id ]: (_: any, { row }: { row: number }) => {
          if (this.tableDefinition) {
            this.tableDefinition.rxapOnAction(action, this.ui.data.getItem(row));
          }
        }
      }), {} as any);
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
    console.log({ view, params });
    return this.connection.toPromise();
  }

}
