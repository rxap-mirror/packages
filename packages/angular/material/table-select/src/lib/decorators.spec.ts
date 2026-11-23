import { InjectionToken } from '@angular/core';
import { FormSystemMetadataKeys } from '@rxap/form-system';
import { getMetadata } from '@rxap/reflect-metadata';
import {
  TABLE_SELECT_COLUMN_MAP,
  TABLE_SELECT_DATA_SOURCE,
  TABLE_SELECT_METHOD,
  TABLE_SELECT_TO_DISPLAY,
  TABLE_SELECT_TO_VALUE,
  UseTableSelectColumns,
  UseTableSelectDataSource,
  UseTableSelectMethod,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from './decorators';

describe('table select decorators', () => {
  it('uses distinct metadata keys', () => {
    const keys = [
      TABLE_SELECT_COLUMN_MAP,
      TABLE_SELECT_TO_DISPLAY,
      TABLE_SELECT_TO_VALUE,
      TABLE_SELECT_METHOD,
      TABLE_SELECT_DATA_SOURCE,
    ];
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('stores the column map', () => {
    class Form {}
    const columns = { name: { label: 'Name' } };
    UseTableSelectColumns(columns)(Form.prototype, 'company');
    expect(getMetadata<Map<string, unknown>>(TABLE_SELECT_COLUMN_MAP, Form.prototype)!.get('company')).toBe(columns);
  });

  it('stores toDisplay and toValue', () => {
    class Form {}
    const toDisplay = (v: any) => v.name;
    const toValue = (v: any) => v.id;
    UseTableSelectToDisplay(toDisplay)(Form.prototype, 'company');
    UseTableSelectToValue(toValue)(Form.prototype, 'company');
    expect(getMetadata<Map<string, unknown>>(TABLE_SELECT_TO_DISPLAY, Form.prototype)!.get('company')).toBe(toDisplay);
    expect(getMetadata<Map<string, unknown>>(TABLE_SELECT_TO_VALUE, Form.prototype)!.get('company')).toBe(toValue);
  });

  it('stores the method without overwriting toValue', () => {
    class Form {}
    const toValue = (v: any) => v.id;
    const method = { call: vi.fn() };
    UseTableSelectToValue(toValue)(Form.prototype, 'company');
    UseTableSelectMethod(method as any)(Form.prototype, 'company');
    expect(getMetadata<Map<string, unknown>>(TABLE_SELECT_TO_VALUE, Form.prototype)!.get('company')).toBe(toValue);
    expect(getMetadata<Map<string, unknown>>(TABLE_SELECT_METHOD, Form.prototype)!.get('company')).toBe(method);
  });

  it('registers the data source with settings', () => {
    class Form {}
    const token = new InjectionToken<any>('ds');
    const settings = { transformer: (v: any) => v };
    UseTableSelectDataSource(token, settings)(Form.prototype, 'company');
    const map = getMetadata<Map<string, Map<string, any>>>(FormSystemMetadataKeys.DATA_SOURCES, Form.prototype)!;
    expect(map.get('company')!.get(TABLE_SELECT_DATA_SOURCE)).toEqual({ dataSource: token, settings });
  });
});
