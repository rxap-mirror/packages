import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { observableDataSource, staticDataSource } from '@rxap/data-source';
import { PaginationDataSource } from '@rxap/data-source/pagination';
import { PaginatorFake } from '@rxap/data-source/testing';
import { BehaviorSubject } from 'rxjs';
import { PaginationDataSourceDirective } from './pagination-data-source.directive';
import { ToPaginationPipe } from './to-pagination.pipe';

describe('ToPaginationPipe', () => {
  const pipe = new ToPaginationPipe();

  it.each([
    ['an array', () => [1, 2, 3]],
    ['an observable', () => new BehaviorSubject([1, 2, 3])],
    ['a data source', () => staticDataSource([1, 2, 3], { id: 's' })],
  ])('wraps %s into a pagination data source', (_, factory) => {
    const paginator = new PaginatorFake(2, 0, 0);
    const ds = pipe.transform(factory() as any, paginator);
    expect(ds).toBeInstanceOf(PaginationDataSource);
    const result: unknown[] = [];
    ds.connect({ id: 'v' }).subscribe((r) => result.push(r));
    expect(result.at(-1)).toEqual([1, 2]);
  });

  it('accepts a missing paginator', () => {
    expect(pipe.transform([1])).toBeInstanceOf(PaginationDataSource);
    expect(observableDataSource).toBeDefined();
  });
});

@Component({
  imports: [PaginationDataSourceDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ng-template rxapPaginationDataSource let-item [rxapPaginationDataSourceFrom]="source()" [rxapPaginationDataSourcePaginator]="paginator">
      <li class="item">{{ item }}</li>
    </ng-template>
  `,
})
class HostComponent {
  paginator = new PaginatorFake(2, 0, 0);
  source = signal<any>(null);
}

describe('PaginationDataSourceDirective', () => {
  it('assigns the paginator to the pagination data source and renders the page', async () => {
    const f = TestBed.createComponent(HostComponent);
    const ds = new PaginationDataSource<number>(staticDataSource([1, 2, 3, 4], { id: 's' }), null);
    f.componentInstance.source.set(ds);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(ds.paginator).toBe(f.componentInstance.paginator);
    expect(f.nativeElement.querySelectorAll('.item')).toHaveLength(2);
  });

  it('throws when the data source is not a pagination data source', () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.source.set(staticDataSource([1], { id: 's' }));
    expect(() => {
      f.detectChanges();
      TestBed.tick();
    }).toThrow(/not a AbstractPaginationDataSource/);
  });
});
