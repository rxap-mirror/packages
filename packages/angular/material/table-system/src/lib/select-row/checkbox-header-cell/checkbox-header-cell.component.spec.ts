import { CdkTable } from '@angular/cdk/table';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from '../tokens';
import { SelectRowService } from '../select-row.service';
import { CheckboxHeaderCellComponent } from './checkbox-header-cell.component';

const rows = [{ id: 1 }, { id: 2 }];

@Component({
  standalone: true,
  imports: [CheckboxHeaderCellComponent],
  providers: [
    SelectRowService,
    { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: true } },
    { provide: CdkTable, useValue: { _data: rows } },
  ],
  template: `<table><tr><th rxap-checkbox-header-cell></th></tr></table>`,
})
class HostComponent {}

@Component({
  standalone: true,
  imports: [CheckboxHeaderCellComponent],
  providers: [SelectRowService, { provide: CdkTable, useValue: { _data: rows } }],
  template: `<table><tr><th rxap-checkbox-header-cell></th></tr></table>`,
})
class SingleHostComponent {}

describe('CheckboxHeaderCellComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent, SingleHostComponent] }));

  it('selects and clears all rows', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = fixture.debugElement.injector.get(SelectRowService);
    const checkbox = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatCheckboxHarness);
    await checkbox.check();
    expect(service.selectedRows).toEqual(rows);
    expect(await checkbox.isChecked()).toBe(true);
    await checkbox.uncheck();
    expect(service.selectedRows).toEqual([]);
  });

  it('is indeterminate with a partial selection', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = fixture.debugElement.injector.get(SelectRowService);
    service.selectionModel.select(rows[0]);
    const checkbox = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatCheckboxHarness);
    expect(await checkbox.isIndeterminate()).toBe(true);
    expect(await checkbox.isChecked()).toBe(false);
  });

  it('renders no checkbox for a single selection', () => {
    const fixture = TestBed.createComponent(SingleHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeNull();
  });
});
