import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RXAP_TABLE_FILTER } from '../table-data-source.directive';
import { TableColumnFilterInputDirective } from './table-column-filter-input.directive';
import { TableColumnFilterService } from './table-column-filter.service';

describe('TableColumnFilterService', () => {
  it('sets and removes column filters', () => {
    const service = new TableColumnFilterService();
    service.setFilter('a', 'x');
    expect(service.current).toEqual({ a: 'x' });
    service.setFilter('a', '');
    expect(service.current).toEqual({});
    service.setFilter('b', null);
    expect(service.change.value).toEqual({});
  });

  it('returns a copy as current', () => {
    const service = new TableColumnFilterService();
    expect(service.current).not.toBe(service.change.value);
  });
});

@Component({
  standalone: true,
  imports: [FormsModule, TableColumnFilterInputDirective],
  template: `<input [(ngModel)]="value" rxapTableColumnFilterInput column="name" />`,
})
class HostComponent {
  value = '';
}

describe('TableColumnFilterInputDirective', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces ngModel changes into the filter service', async () => {
    jest.useFakeTimers();
    const filter = new TableColumnFilterService();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: RXAP_TABLE_FILTER, useValue: filter }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // flush the NgModel control registration (resolved promise)
    await jest.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'abc';
    input.nativeElement.dispatchEvent(new Event('input'));
    await jest.advanceTimersByTimeAsync(499);
    expect(filter.current).toEqual({});
    await jest.advanceTimersByTimeAsync(1);
    expect(filter.current).toEqual({ name: 'abc' });
    fixture.destroy();
  });
});
