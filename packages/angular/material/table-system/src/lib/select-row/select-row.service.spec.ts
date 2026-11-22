import { TestBed } from '@angular/core/testing';
import { SelectRowService } from './select-row.service';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from './tokens';

describe('SelectRowService', () => {
  function create(options?: any) {
    TestBed.configureTestingModule({
      providers: [
        SelectRowService,
        ...(options ? [{ provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: options }] : []),
      ],
    });
    return TestBed.inject(SelectRowService<any>);
  }

  it('is not multiple when the options omit multiple', () => {
    const service = create({ selected: [] });
    service.selectionModel.select({ a: 1 });
    service.selectionModel.select({ a: 2 });
    expect(service.selectedRows).toEqual([{ a: 2 }]);
  });

  it('is not multiple by default', () => {
    const service = create();
    service.selectionModel.select({ a: 1 });
    service.selectionModel.select({ a: 2 });
    expect(service.selectedRows).toEqual([{ a: 2 }]);
  });

  it('emits the selected rows', () => {
    const service = create({ multiple: true });
    const spy = jest.fn();
    service.selectedRows$.subscribe(spy);
    service.selectionModel.select({ a: 1 }, { a: 2 });
    expect(spy).toHaveBeenCalledWith([{ a: 1 }, { a: 2 }]);
  });

  it('clears the selection', () => {
    const service = create({ multiple: true, selected: [{ a: 1 }] });
    expect(service.selectedRows).toHaveLength(1);
    service.clear();
    expect(service.selectedRows).toHaveLength(0);
  });

  it('compares by identity and identifier', () => {
    const service = create();
    const row = { a: 1 };
    expect(service.compareWith(row, row)).toBe(true);
    expect(service.compareWith({ uuid: '1' }, { uuid: '1' })).toBe(true);
    expect(service.compareWith({ uuid: '1' }, { uuid: '2' })).toBe(false);
    expect(service.compareWith({ a: 1 }, { a: 1 })).toBe(false);
  });

  it('uses a custom compareWith', () => {
    const service = create({ multiple: true, compareWith: (a: any, b: any) => a.k === b.k });
    service.selectionModel.select({ k: 1 });
    expect(service.selectionModel.isSelected({ k: 1 })).toBe(true);
  });
});
