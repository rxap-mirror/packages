import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SelectedRowsDirective } from './selected-rows.directive';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from './tokens';
import { SelectRowService } from './select-row.service';

@Component({
  standalone: true,
  imports: [SelectedRowsDirective],
  providers: [SelectRowService, { provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS, useValue: { multiple: true } }],
  template: `<span *rxapSelectedRows="let rows">{{ rows.length }}</span>`,
})
class HostComponent {}

describe('SelectedRowsDirective', () => {
  it('renders the template after the selection changed', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span')).toBeNull();
    const service = fixture.debugElement.injector.get(SelectRowService);
    service.selectionModel.select({ a: 1 }, { a: 2 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('2');
    service.selectionModel.clear();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('0');
  });
});
