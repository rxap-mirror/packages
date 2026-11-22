import { Injector } from '@angular/core';
import { RxapFormControl, RxapFormGroup } from '@rxap/forms';
import { RxapFormSystemError } from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import {
  UseTableSelectColumns,
  UseTableSelectToDisplay,
  UseTableSelectToValue,
} from './decorators';
import { ExtractTableSelectColumnMapMixin } from './extract-table-select-column-map.mixin';
import { ExtractTableSelectDataSourceMixin } from './extract-table-select-data-source.mixin';
import { ExtractTableSelectToDisplayMixin } from './extract-table-select-to-display.mixin';
import { ExtractTableSelectToValueMixin } from './extract-table-select-to-value.mixin';
import { TABLE_SELECT_DATA_SOURCE, UseTableSelectDataSource } from './decorators';

class Definition {}
const columns = { name: { label: 'Name' } };
const toDisplay = (v: any) => v.name;
const toValue = (v: any) => v.id;
UseTableSelectColumns(columns)(Definition.prototype, 'company');
UseTableSelectToDisplay(toDisplay)(Definition.prototype, 'company');
UseTableSelectToValue(toValue)(Definition.prototype, 'company');

class EmptyDefinition {}

function controlFor(definition: object, controlId = 'company') {
  const control = new RxapFormControl(null, { controlId });
  const group = new RxapFormGroup({ [controlId]: control }, { controlId: 'form' });
  Reflect.set(group, '_rxapFormDefinition', definition);
  return control;
}

interface Probe extends ExtractTableSelectColumnMapMixin, ExtractTableSelectToDisplayMixin, ExtractTableSelectToValueMixin,
  ExtractTableSelectDataSourceMixin<any> {}

@Mixin(ExtractTableSelectColumnMapMixin, ExtractTableSelectToDisplayMixin, ExtractTableSelectToValueMixin, ExtractTableSelectDataSourceMixin)
class Probe {
  [key: string]: any;
  columns = (c: RxapFormControl) => this['extractTableSelectColumnMap'](c);
  display = (c: RxapFormControl) => this['extractTableSelectToDisplay'](c);
  value = (c: RxapFormControl) => this['extractTableSelectToValue'](c);
}

describe('table select extract mixins', () => {
  const probe = new Probe();

  it('extracts the column map', () => {
    expect(probe.columns(controlFor(new Definition()))).toBe(columns);
  });
  it('extracts toDisplay', () => {
    expect(probe.display(controlFor(new Definition()))).toBe(toDisplay);
  });
  it('extracts toValue', () => {
    expect(probe.value(controlFor(new Definition()))).toBe(toValue);
  });

  it('throws without metadata', () => {
    const control = controlFor(new EmptyDefinition());
    expect(() => probe.columns(control)).toThrow(RxapFormSystemError);
    expect(() => probe.display(control)).toThrow(RxapFormSystemError);
    expect(() => probe.value(control)).toThrow(RxapFormSystemError);
  });

  it('throws when the control is not part of the metadata', () => {
    const control = controlFor(new Definition(), 'other');
    expect(() => probe.columns(control)).toThrow(RxapFormSystemError);
    expect(() => probe.display(control)).toThrow(RxapFormSystemError);
    expect(() => probe.value(control)).toThrow(RxapFormSystemError);
  });

  it('extracts the data source via the loader and applies the transformer', () => {
    class DsDefinition {}
    const source = { id: 'src' };
    UseTableSelectDataSource(source as any)(DsDefinition.prototype, 'company');
    const loaded = {};
    const dataSourceLoader = { load: jest.fn(() => loaded) };
    const p: any = new Probe();
    p.dataSourceLoader = dataSourceLoader;
    p.injector = Injector.NULL;
    const result = p.extractTableSelectDataSource.call(Object.assign(p, { control: controlFor(new DsDefinition()) }));
    expect(result).toBe(loaded);
    expect(dataSourceLoader.load).toHaveBeenCalledWith(source, undefined, Injector.NULL);
    expect(TABLE_SELECT_DATA_SOURCE).toBeDefined();
  });
});
