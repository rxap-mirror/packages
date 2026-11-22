import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from '../tokens';
import { SelectRowService } from '../select-row.service';
import { CheckboxCellComponent } from './checkbox-cell.component';

const row = { id: 1 };

@Component({
  standalone: true,
  imports: [CheckboxCellComponent],
  providers: [SelectRowService, { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: true } }],
  template: `<table><tr><td rxap-checkbox-cell [element]="row"></td></tr></table>`,
})
class HostComponent {
  row = row;
}

describe('CheckboxCellComponent', () => {
  it('reflects and toggles the selection of the row', async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const service = fixture.debugElement.injector.get(SelectRowService);
    const checkbox = await loader.getHarness(MatCheckboxHarness);
    expect(await checkbox.isChecked()).toBe(false);
    await checkbox.check();
    expect(service.selectedRows).toEqual([row]);
    service.selectionModel.clear();
    expect(await checkbox.isChecked()).toBe(false);
    service.selectionModel.select(row);
    expect(await checkbox.isChecked()).toBe(true);
  });
});
