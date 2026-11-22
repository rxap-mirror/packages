import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SelectRowService } from '../select-row/select-row.service';
import { TableFilterService } from '../table-filter/table-filter.service';
import { TableColumnMenuComponent } from './table-column-menu.component';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';
import { TableShowArchivedSlideComponent } from './table-show-archived-slide/table-show-archived-slide.component';

@Component({
  standalone: true,
  imports: [TableColumnMenuComponent, TableColumnOptionComponent, TableShowArchivedSlideComponent],
  providers: [TableFilterService, SelectRowService],
  template: `
    <rxap-table-column-menu inline matCard>
      <rxap-table-column-option name="a">Column A</rxap-table-column-option>
      <rxap-table-column-option name="b" inactive>Column B</rxap-table-column-option>
      <rxap-table-column-option name="c" [hidden]="true">Column C</rxap-table-column-option>
      <rxap-table-column-option name="d" [show]="show()">Column D</rxap-table-column-option>
      <rxap-table-column-option name="removedAt" active>Removed</rxap-table-column-option>
      <rxap-table-show-archived-slide></rxap-table-show-archived-slide>
    </rxap-table-column-menu>
  `,
})
class HostComponent {
  show = signal(false);
  slide = viewChild.required(TableShowArchivedSlideComponent);
}

describe('TableColumnMenuComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const menu: TableColumnMenuComponent = fixture.debugElement.query(By.directive(TableColumnMenuComponent)).componentInstance;
    return { fixture, menu };
  }

  it('computes visible and active columns', () => {
    const { menu, fixture } = setup();
    expect(menu.visibleColumns().map((c) => c.name())).toEqual(['a', 'b', 'removedAt']);
    // the archived slide deactivates the removedAt column after the first render
    expect(menu.displayColumns()).toEqual(['a', 'c', 'd']);
    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    expect(menu.visibleColumns().map((c) => c.name())).toContain('d');
  });

  it('activates and deactivates columns and persists the state', () => {
    const { menu } = setup();
    menu.activate('b');
    expect(menu.displayColumns()).toContain('b');
    expect(localStorage.length).toBeGreaterThan(0);
    menu.deactivate('b');
    expect(menu.displayColumns()).not.toContain('b');
    const option = menu.columns()[0];
    option.toggle();
    expect(option.active()).toBe(false);
    option.toggle();
    expect(option.active()).toBe(true);
    expect(option.display).toBe('Column A');
  });

  it('restores a cached state', () => {
    const fixture0 = setup();
    fixture0.menu.deactivate('a');
    fixture0.fixture.destroy();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
    expect(setup().menu.displayColumns()).toEqual(['c', 'd']);
  });

  it('toggles host classes', () => {
    const { fixture } = setup();
    const el = fixture.debugElement.query(By.directive(TableColumnMenuComponent)).nativeElement;
    expect(el.classList).toContain('inline');
    expect(el.classList).toContain('mat-card-mode');
  });

  it('opens the menu and lists the columns', async () => {
    const { fixture } = setup();
    const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatMenuHarness);
    await menu.open();
    expect((await menu.getItems()).length).toBeGreaterThanOrEqual(3);
  });

  it('show archived toggles the filter, selection and columns', async () => {
    const { fixture, menu } = setup();
    const filter = fixture.debugElement.injector.get(TableFilterService);
    const select = fixture.debugElement.injector.get(SelectRowService);
    const clear = jest.spyOn(select, 'clear');
    const slide: TableShowArchivedSlideComponent = fixture.componentInstance.slide();
    slide.onChange({ checked: true } as any);
    expect(filter.current['__archived']).toBe(true);
    expect(clear).toHaveBeenCalled();
    expect(menu.displayColumns()).toContain('removedAt');
    slide.onChange({ checked: false } as any);
    expect(filter.current['__archived']).toBe(false);
    expect(menu.displayColumns()).not.toContain('removedAt');
  });
});
