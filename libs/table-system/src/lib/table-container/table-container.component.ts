import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  Optional,
  Inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  RxapTableDefinition,
  RXAP_TABLE_SYSTEM_DEFINITION
} from '../definition/table-definition';
import { WebixDataTableComponent } from '../webix-data-table/webix-data-table.component';
import { TableDataSource } from '../table.data-source';
import {
  DataSourceLoader,
  RXAP_DATA_SOURCE_TOKEN
} from '@rxap/data-source';
import { TableDefinitionLoader } from '../table-definition-loader';

@Component({
  selector:        'rxap-table-container',
  templateUrl:     './table-container.component.html',
  styleUrls:       [ './table-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableContainerComponent<RowData> implements OnInit, OnDestroy {

  public hasAddAction: boolean = false;

  @ViewChild(WebixDataTableComponent, { static: true }) dataTable!: WebixDataTableComponent<RowData>;

  @Input() public tableDefinition!: RxapTableDefinition<RowData>;
  @Input() public dataSource!: TableDataSource<RowData>;

  @Input() public tableId!: string;
  @Input() public dataSourceId!: string;

  public loaded = false;

  protected _subscription = new Subscription();

  constructor(
    public readonly route: ActivatedRoute,
    public readonly tableDefinitionLoader: TableDefinitionLoader,
    public readonly dataSourceLoader: DataSourceLoader,
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

  public ngOnInit(): void {

    this._subscription.add(
      this.route.data.subscribe(data => {

        if (data && data.dx && data.dx.table) {
          const config      = data.dx.table || {};
          this.tableId      = config.definitionId;
          this.dataSourceId = config.dataSourceId;
        }

        this.loadTable();

      })
    );

  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public menuColumnTrack(index: number, item: any) {
    return item.id;
  }

  private loadTable() {
    if (!this.tableDefinition) {
      if (this.tableId) {
        this.tableDefinition = this.tableDefinitionLoader.load(this.tableId);
      }
    }
    if (!this.dataSource) {
      if (this.dataSourceId) {
        this.dataSource = this.dataSourceLoader.load(this.dataSourceId);
      } else {
        throw new Error('Data Source and data source id are undefined');
      }
    }
    this.loaded = true;
  }

}
