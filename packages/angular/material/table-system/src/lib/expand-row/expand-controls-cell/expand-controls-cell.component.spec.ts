import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ExpandRowService } from '../expand-row.service';
import { ExpandControlsCellComponent } from './expand-controls-cell.component';

const row = { id: 1 };

@Component({
  standalone: true,
  imports: [ExpandControlsCellComponent],
  providers: [ExpandRowService],
  template: `<table><tr><td rxap-expand-controls-cell [element]="row"></td></tr></table>`,
})
class HostComponent {
  row = row;
}

describe('ExpandControlsCellComponent', () => {
  it('shows an icon depending on the expanded state', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const icon = () => fixture.nativeElement.querySelector('mat-icon').textContent.trim();
    expect(icon()).toBe('keyboard_arrow_right');
    fixture.debugElement.injector.get(ExpandRowService).toggleRow(row);
    fixture.detectChanges();
    expect(icon()).toBe('expand_more');
  });
});
