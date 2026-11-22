import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { PersistentPaginatorDirective } from './persistent-paginator.directive';

@Component({
  standalone: true,
  imports: [MatPaginator, PersistentPaginatorDirective],
  template: `<mat-paginator rxapPersistent id="p1" [length]="100" [pageSize]="10"></mat-paginator>`,
})
class HostComponent {}

describe('PersistentPaginatorDirective', () => {
  const key = 'rxap_mat-paginator-persistentp1';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.directive(PersistentPaginatorDirective));
    return {
      directive: de.injector.get(PersistentPaginatorDirective),
      paginator: de.injector.get(MatPaginator),
    };
  }

  it('restores the page size from the storage', () => {
    localStorage.setItem(key, JSON.stringify({ pageSize: 25 }));
    expect(create().paginator.pageSize).toBe(25);
  });

  it('stores the page size on page events', () => {
    const { paginator } = create();
    paginator.pageSize = 50;
    paginator.page.emit({ pageIndex: 0, pageSize: 50, length: 100, previousPageIndex: 0 });
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({ pageSize: 50 });
  });

  it('ignores invalid stored configs', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(key, '{invalid');
    const { directive, paginator } = create();
    expect(directive.restoreConfig()).toBeNull();
    expect(paginator.pageSize).toBe(10);
    expect(console.warn).toHaveBeenCalled();
  });
});
