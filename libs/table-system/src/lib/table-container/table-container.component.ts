import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  Injector,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RxapTableDefinition } from '../definition/table-definition';

@Component({
  selector:        'rxap-table-container',
  templateUrl:     './table-container.component.html',
  styleUrls:       [ './table-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableContainerComponent<RowData> implements OnInit, OnDestroy {

  public hasAddAction: boolean = false;

  @Input() public definition: RxapTableDefinition<RowData>;

  protected _subscription = new Subscription();

  constructor(
    public readonly logger: NGXLogger,
    public injector: Injector,
    public readonly route: ActivatedRoute
  ) {
  }

  public ngOnInit(): void {

    this._subscription.add(
      this.route.data.subscribe(data => {

        if (data && data.dx && data.dx.table) {
          const config = data.dx.table || {};
          this.update(config);
        }

        this.loadTable();

      })
    );

  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  onAddClick() {
    this.store$.dispatch(this.definition.addAction);
  }

  private update(config): void {
    this.logger.debug(`[TableContainerComponent::update]`, config);
    this.definitionId = config.definitionId || this.definitionId;
    this.dataSourceId = config.dataSourceId || this.dataSourceId;
    this.overflow     = config.overflow;
    if (config.infiniteScrolling) {
      this.maxHeight = '80vh';
      this.overflow  = 'auto';
    }
    if (Object.keys(config).length) {
      const injectorConfig = this.injector.get(DX_TABLE_CONFIG, {} as Partial<DxTableConfig<any>>);
      this.injector        = Injector.create({
        parent:    this.injector,
        providers: [
          {
            provide:  DX_TABLE_CONFIG,
            // TODO : deep merge
            useValue: {
              ...injectorConfig,
              ...config
            }
          }
        ]
      });
    }
  }

  private loadTable() {
    this.logger.debug(`[TableContainerComponent::loadTable]`, { definitionId: this.definitionId, dataSource: this.dataSource });
    if (!this.definition) {
      const tableId = this.definitionId;
      if (!this.definitionId) {
        this.definitionId = DEFAULT_TABLE_DEFINITION;
      }
      this.definition = CreateInstance(this.injector, this.definitionRegistry, this.definitionId);
      this.definition.init();
      // set id after init. So the row and alle columns are updated with the id
      this.definition.id = tableId || this.definition.rowDefinitionId;
      this.logger.debug(`[TableContainerComponent] use table definition with id '${this.definitionId}'`);
    }
    if (!this.dataSource) {
      if (!this.dataSourceId) {
        this.dataSourceId = this.definition.dataSourceId || DEFAULT_TABLE_DATA_SOURCE;
      }
      this.dataSource                = CreateInstance(this.injector, this.dataSourceRegistry, this.dataSourceId);
      this.dataSource.collectionPath = this.definition.collectionPath || this.dataSource.collectionPath;
      this.dataSource.sortDefault    = this.definition.sortDefault || this.dataSource.sortDefault;
      this.logger.debug(`[TableContainerComponent] use data source with id '${this.dataSourceId}'`);
    }
    this.hasAddAction = !!this.definition.addAction;
  }

}
