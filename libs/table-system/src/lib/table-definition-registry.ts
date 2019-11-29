import {
  Type,
  getMetadata
} from '@rxap/utilities';
import { RxapTableDefinition } from './definition/table-definition';
import { TableDefinitionMetaData } from './definition/decorators/table-definition';
import { TableDefinitionMetaDataKeys } from './definition/decorators/meta-data-keys';
import { Injectable } from '@angular/core';

export function getTableDefinitionId(tableDefinitionType: Type<RxapTableDefinition<any>>) {
  const tableDefinitionMetaData: TableDefinitionMetaData | null = getMetadata<TableDefinitionMetaData>(
    TableDefinitionMetaDataKeys.TABLE_DEFINITION,
    tableDefinitionType
  );
  if (!tableDefinitionMetaData) {
    throw new Error('TableDefinition Constructor has not a meta data definition');
  }
  if (!tableDefinitionMetaData.tableId) {
    throw new Error('Table definition meta data has not a tableId');
  }
  return tableDefinitionMetaData.tableId;
}

@Injectable({ providedIn: 'root' })
export class TableDefinitionRegistry {

  public tableDefinitions = new Map<string, Type<RxapTableDefinition<any>>>();

  public register(tableDefinitionType: Type<RxapTableDefinition<any>>, tableId: string = getTableDefinitionId(tableDefinitionType)) {
    if (!tableId) {
      throw new Error('Can not register a table definition without an tableId');
    }
    this.tableDefinitions.set(tableId, tableDefinitionType);
  }

  public has(tableId: string): boolean {
    return this.tableDefinitions.has(tableId);
  }

  public get<T extends RxapTableDefinition<any>>(tableId: string): Type<T> {
    if (!this.has(tableId)) {
      throw new Error(`Table definition with table id '${tableId}' is not registered`);
    }
    return this.tableDefinitions.get(tableId) as any;
  }

}
