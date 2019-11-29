import {
  Injector,
  InjectFlags,
  Injectable
} from '@angular/core';
import {
  Type,
  getMetadata,
  KeyValue
} from '@rxap/utilities';
import { RxapTableDefinition } from './definition/table-definition';
import {
  getTableDefinitionId,
  TableDefinitionRegistry
} from './table-definition-registry';
import { RxapColumn } from '@rxap/table-system';
import { TableDefinitionMetaDataKeys } from './definition/decorators/meta-data-keys';
import { RxapColumnMetaData } from './definition/decorators/column';

export interface LoaderTableDefinitionMetaData {
  columns: RxapColumnMetaData[];
}

@Injectable({ providedIn: 'root' })
export class TableDefinitionLoader {

  public static build<T extends RxapTableDefinition<any>>(tableDefinitionType: Type<T>, injector?: Injector, tableId?: string): T {

    if (!tableId) {
      tableId = getTableDefinitionId(tableDefinitionType);
    }

    const metaData = TableDefinitionLoader.extractMetaData(tableDefinitionType);

    const formDefinition = injector ? injector.get(tableDefinitionType, new tableDefinitionType(), InjectFlags.Optional) : new tableDefinitionType();

    const columnMap = TableDefinitionLoader.buildColumns(metaData.columns);

    // assign created form controls to form definition instance
    Object.assign(formDefinition, columnMap);

    if (tableId) {
      formDefinition.tableId = tableId;
    } else {
      throw new Error('Table Definition has not a table id');
    }

    formDefinition.columnsKeys = metaData.columns.map(column => column.propertyKey);

    return formDefinition;

  }

  public static extractMetaData(tableDefinitionType: Type<RxapTableDefinition<any>>): LoaderTableDefinitionMetaData {
    return {
      columns: (getMetadata<string[]>(TableDefinitionMetaDataKeys.COLUMN, tableDefinitionType.prototype) || []).map(propertyKey => {
        const columnMetaData = getMetadata<RxapColumnMetaData>(TableDefinitionMetaDataKeys.COLUMN, tableDefinitionType.prototype, propertyKey);
        if (!columnMetaData) {
          throw new Error(`table column meta data for propertyKey '${propertyKey}' not defined`);
        }
        return columnMetaData;
      })
    };
  }

  public static buildColumns(columns: RxapColumnMetaData[]): KeyValue<RxapColumn> {
    return columns.reduce((columnMap, column) => ({ ...columnMap, [ column.propertyKey ]: column }), {});
  }

  constructor(
    public readonly injector: Injector,
    public readonly tableDefinitionRegistry: TableDefinitionRegistry
  ) {}

  public load<T extends RxapTableDefinition<any>>(tableId: string, injector?: Injector): T;
  // tslint:disable-next-line:unified-signatures
  public load<T extends RxapTableDefinition<any>>(tableDefinition: Type<T>, injector?: Injector): T;
  public load<T extends RxapTableDefinition<any>>(
    tableIdOrDefinition: string | Type<T>,
    injector: Injector = this.injector
  ): T {

    let tableDefinitionType: Type<T>;
    let tableId: string;

    if (typeof tableIdOrDefinition === 'string') {
      tableDefinitionType = this.tableDefinitionRegistry.get<T>(tableIdOrDefinition);
      tableId             = tableIdOrDefinition;
    } else {
      tableDefinitionType = tableIdOrDefinition;
      tableId             = getTableDefinitionId(tableDefinitionType);
    }

    return TableDefinitionLoader.build(tableDefinitionType, injector, tableId);
  }

}
