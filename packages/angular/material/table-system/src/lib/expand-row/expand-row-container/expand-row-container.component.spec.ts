import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ExpandRowService } from '../expand-row.service';
import { ExpandRowContainerComponent } from './expand-row-container.component';
import { ExpandRowContentDirective } from './expand-row-content.directive';

const row = { id: 1, name: 'Row' };

@Component({
  standalone: true,
  imports: [ExpandRowContainerComponent, ExpandRowContentDirective],
  providers: [ExpandRowService],
  template: `
    <table>
      <tr>
        <td rxap-expand-row [element]="row">
          <span class="projected">projected</span>
          <ng-template rxapExpandRowContent let-r><b class="content">{{ r.name }}</b></ng-template>
        </td>
      </tr>
    </table>
  `,
})
class HostComponent {
  row = row;
}

describe('ExpandRowContainerComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideNoopAnimations()] }),
  );

  it('lazily renders the content on first expand and keeps it', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = fixture.debugElement.injector.get(ExpandRowService);
    const query = () => fixture.nativeElement.querySelector('.content');
    expect(fixture.nativeElement.querySelector('.projected')).toBeTruthy();
    expect(query()).toBeNull();
    service.toggleRow(row);
    fixture.detectChanges();
    expect(query().textContent).toBe('Row');
    service.toggleRow(row);
    fixture.detectChanges();
    expect(query()).toBeTruthy();
    const cmp = fixture.debugElement.query(By.directive(ExpandRowContainerComponent)).componentInstance;
    expect(cmp.portal()).not.toBeNull();
  });
});
