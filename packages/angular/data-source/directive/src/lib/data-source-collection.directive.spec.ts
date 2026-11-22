import { Component, Injectable, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BaseDataSource, ObservableDataSource, RxapDataSource, StaticDataSource } from '@rxap/data-source';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  DataSourceCollectionDirective,
  DataSourceCollectionTemplateContext,
} from './data-source-collection.directive';

@RxapDataSource({ id: 'filled', data: ['data1', 'data2', 'data3', 'data4', 'data5', 'data6'] })
@Injectable()
class TestDataSource extends StaticDataSource<string[]> {}

@RxapDataSource({ id: 'empty', data: [] })
@Injectable()
class TestEmptyDataSource extends StaticDataSource<string[]> {}

@Component({
  imports: [DataSourceCollectionDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div *rxapDataSourceCollection="let item from dataSource; empty: empty">{{ item }}</div>
    <ng-template #empty><span id="empty">empty</span></ng-template>
  `,
})
class StarHostComponent {
  readonly dataSource = inject(TestDataSource);
}

@Component({
  imports: [DataSourceCollectionDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ng-template #emptyTpl><span id="empty">empty</span></ng-template>
    <ng-template #errorTpl let-error let-refresh="refresh">
      <span id="error">{{ error.message }}</span><button id="refresh" (click)="refresh()">r</button>
    </ng-template>
    <ng-template
      rxapDataSourceCollection
      let-item
      let-index="index"
      let-count="count"
      let-first="first"
      let-last="last"
      let-even="even"
      let-odd="odd"
      [rxapDataSourceCollectionFrom]="source()"
      [rxapDataSourceCollectionEmpty]="emptyTpl"
      [rxapDataSourceCollectionErrorTemplate]="errorTpl"
      [rxapDataSourceCollectionTrackBy]="trackBy"
      (loaded)="loaded = loaded + 1"
      (error)="errors.push($event)"
    >
      <li class="item">{{ item }}|{{ index }}|{{ count }}|{{ first }}|{{ last }}|{{ even }}|{{ odd }}</li>
    </ng-template>
  `,
})
class TemplateHostComponent {
  source = signal<any>(null);
  trackBy: any = undefined;
  loaded = 0;
  errors: unknown[] = [];
}

describe('DataSourceCollectionDirective', () => {
  describe('with the structural syntax', () => {
    it('renders every item of a filled data source', async () => {
      TestBed.configureTestingModule({ providers: [TestDataSource] });
      const f = TestBed.createComponent(StarHostComponent);
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();
      expect(f.debugElement.queryAll(By.css('div'))).toHaveLength(6);
      expect(f.nativeElement.querySelector('#empty')).toBeNull();
    });

    it('renders the empty template for an empty data source', async () => {
      TestBed.configureTestingModule({ providers: [{ provide: TestDataSource, useClass: TestEmptyDataSource }] });
      const f = TestBed.createComponent(StarHostComponent);
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();
      expect(f.debugElement.queryAll(By.css('div'))).toHaveLength(0);
      expect(f.nativeElement.querySelector('#empty')).not.toBeNull();
    });
  });

  describe('with an observable data source', () => {
    let data$: BehaviorSubject<any[]>;
    let ds: ObservableDataSource<any[]>;
    let fixture: ComponentFixture<TemplateHostComponent>;
    let host: TemplateHostComponent;

    const items = () =>
      Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.item')).map((e) => e.textContent);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const directive = () =>
      fixture.debugElement.queryAllNodes(By.directive(DataSourceCollectionDirective))[0].injector.get(DataSourceCollectionDirective);

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
      data$ = new BehaviorSubject<any[]>(['a', 'b', 'c']);
      ds = new ObservableDataSource<any[]>(data$, { id: 'obs' });
      TestBed.configureTestingModule({});
      fixture = TestBed.createComponent(TemplateHostComponent);
      host = fixture.componentInstance;
      host.source.set(ds);
    });
    afterEach(() => jest.restoreAllMocks());

    it('renders items with the template context helpers', async () => {
      await settle();
      expect(items()).toEqual(['a|0|3|true|false|true|false', 'b|1|3|false|false|false|true', 'c|2|3|false|true|true|false']);
    });

    it('applies insert, move and remove changes', async () => {
      await settle();
      data$.next(['c', 'a', 'x']);
      await settle();
      expect(items()!.map((i) => i!.split('|')[0])).toEqual(['c', 'a', 'x']);
      expect(items()![2]).toBe('x|2|3|false|true|true|false');
      data$.next(['x']);
      await settle();
      expect(items()).toEqual(['x|0|1|true|true|true|false']);
    });

    it('swaps the empty template with items when the data changes', async () => {
      data$.next([]);
      await settle();
      expect(fixture.nativeElement.querySelector('#empty')).not.toBeNull();
      expect(items()).toEqual([]);
      data$.next(['a']);
      await settle();
      expect(fixture.nativeElement.querySelector('#empty')).toBeNull();
      expect(items()).toHaveLength(1);
      data$.next([]);
      await settle();
      expect(fixture.nativeElement.querySelector('#empty')).not.toBeNull();
      expect(items()).toEqual([]);
    });

    it('re-connects when the bound data source changes', async () => {
      await settle();
      const other = new ObservableDataSource<any[]>(new BehaviorSubject(['z']), { id: 'other' });
      host.source.set(other);
      await settle();
      expect(directive().dataSource).toBe(other);
      expect(items()).toContain('z|0|1|true|true|true|false');
    });

    it('uses trackBy to keep views', async () => {
      host.trackBy = (_: number, item: any) => item.id;
      data$.next([{ id: 1 }, { id: 2 }]);
      await settle();
      const first = fixture.nativeElement.querySelector('.item');
      data$.next([{ id: 1 }, { id: 3 }, { id: 2 }]);
      await settle();
      expect(fixture.nativeElement.querySelector('.item')).toBe(first);
      expect(items()).toHaveLength(3);
    });

    it('renders the error template, emits the error and supports refresh', async () => {
      const failing = new Subject<any[]>();
      const failingDs = new ObservableDataSource<any[]>(failing, { id: 'failing' });
      const refresh = jest.spyOn(failingDs, 'refresh');
      host.source.set(failingDs);
      await settle();
      failing.error(new Error('broken'));
      await settle();
      expect(host.errors).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('#error').textContent).toBe('broken');
      fixture.nativeElement.querySelector('#refresh').click();
      expect(refresh).toHaveBeenCalled();
    });

    it('disconnects on destroy', async () => {
      await settle();
      const disconnect = jest.spyOn(ds, 'disconnect');
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    });

    it('embedErrorTemplate skips silently without an error template', async () => {
      await settle();
      const dir = directive();
      jest.spyOn(dir, 'errorTemplate' as any).mockReturnValue(undefined);
      expect(() => dir.embedErrorTemplate(new Error('x'))).not.toThrow();
    });
  });

  it('provides a template context with helper getters', () => {
    const ctx = new DataSourceCollectionTemplateContext('x', null as any, 1, 3);
    expect([ctx.first, ctx.last, ctx.even, ctx.odd]).toEqual([false, false, false, true]);
    expect(DataSourceCollectionDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
    expect(BaseDataSource).toBeDefined();
  });
});
