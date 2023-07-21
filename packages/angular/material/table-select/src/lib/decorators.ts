import { InjectionToken } from '@angular/core';
import { BaseDataSource } from '@rxap/data-source';
import { AbstractTableDataSource } from '@rxap/data-source/table';
import {
  UseDataSource,
  UseDataSourceSettings,
} from '@rxap/form-system';
import { setMetadataMap } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { TableSelectColumn } from './open-table-select-window.method';

export const TABLE_SELECT_COLUMN_MAP = 'TABLE_SELECT_COLUMN_MAP';
export const TABLE_SELECT_TO_DISPLAY = 'TABLE_SELECT_TO_DISPLAY';
export const TABLE_SELECT_TO_VALUE = 'TABLE_SELECT_TO_VALUE';
export const TABLE_SELECT_DATA_SOURCE = 'TABLE_SELECT_DATA_SOURCE';

export function UseTableSelectColumns(columnMap: Map<string, TableSelectColumn> | Record<string, TableSelectColumn>) {
  return function (target: any, propertyKey: string) {
    setMetadataMap(propertyKey, columnMap, TABLE_SELECT_COLUMN_MAP, target);
  };
}

export function UseTableSelectDataSource<Data extends Record<string, any> = Record<string, any>>(
  dataSource: Constructor<BaseDataSource<Data[]>> | Constructor<AbstractTableDataSource<Data>> | InjectionToken<AbstractTableDataSource<Data> | BaseDataSource<Data[]>>,
  settings?: UseDataSourceSettings,
) {
  return UseDataSource(dataSource, TABLE_SELECT_DATA_SOURCE, settings);
}

export function UseTableSelectToDisplay<Data = Record<string, any>>(toDisplay: (value: Data) => string | Promise<string>) {
  return function (target: any, propertyKey: string) {
    setMetadataMap(propertyKey, toDisplay, TABLE_SELECT_TO_DISPLAY, target);
  };
}

export function UseTableSelectToValue<Data = Record<string, any>>(toValue: (value: Data) => unknown | Promise<unknown>) {
  return function (target: any, propertyKey: string) {
    setMetadataMap(propertyKey, toValue, TABLE_SELECT_TO_VALUE, target);
  };
}
