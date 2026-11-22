import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ExpandRowDirective } from './expand-row.directive';
import { ExpandRowService } from './expand-row.service';

const row1 = { id: 1 };
const row2 = { id: 2 };

@Component({
  standalone: true,
  imports: [ExpandRowDirective],
  providers: [ExpandRowService],
  template: `<table><tr rxapExpandRow [element]="row1"></tr><tr rxapExpandRow [element]="row2"></tr></table>`,
})
class HostComponent {
  row1 = row1;
  row2 = row2;
}

describe('ExpandRowService', () => {
  let service: ExpandRowService<any>;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExpandRowService] });
    service = TestBed.inject(ExpandRowService);
  });

  it('toggles rows', () => {
    service.toggleRow(row1);
    expect(service.isExpanded(row1)).toBe(true);
    expect(service.isExpanded(row2)).toBe(false);
    service.toggleRow(row2);
    expect(service.isExpanded(row1)).toBe(false);
    service.toggleRow(row2);
    expect(service.expandedRow.value).toBeNull();
  });

  it('exposes isExpanded$', () => {
    const values: boolean[] = [];
    service.isExpanded$(row1).subscribe((v) => values.push(v));
    service.toggleRow(row1);
    expect(values).toEqual([false, true]);
  });
});

describe('ExpandRowDirective', () => {
  it('toggles the expanded class on click', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const [a, b] = fixture.debugElement.queryAll(By.directive(ExpandRowDirective));
    a.nativeElement.click();
    fixture.detectChanges();
    expect(a.nativeElement.classList).toContain('expanded-row');
    expect(b.nativeElement.classList).not.toContain('expanded-row');
    b.nativeElement.click();
    fixture.detectChanges();
    expect(a.nativeElement.classList).not.toContain('expanded-row');
    expect(b.nativeElement.classList).toContain('expanded-row');
  });
});
