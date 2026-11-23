import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimeagoDirective } from './timeago.directive';
import { TimeagoFormatter } from './timeago.formatter';
import { TimeagoLivePipe } from './timeago-live.pipe';
import { TimeagoPipe } from './timeago.pipe';

const NOW = new Date('2024-06-01T12:00:00Z').getTime();
const S = 1000;
const M = 60 * S;
const H = 60 * M;
const D = 24 * H;

describe('timeago', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(NOW);
    // join the template parts, strip the "@@id:" meta block
    (globalThis as any).$localize.mockImplementation((s: TemplateStringsArray, ...v: any[]) =>
      s.map((p, i) => (i === 0 ? p.replace(/^:@@[^:]*:/, '') : p) + (i < v.length ? v[ i ] : '')).join(''));
  });
  afterEach(() => vi.useRealTimers());

  describe('TimeagoFormatter', () => {
    it.each([
      [ -500, 'less than a second ago' ],
      [ -30 * S, '30 seconds ago' ],
      [ -90 * S, '2 minutes ago' ],
      [ -60 * S, 'about a minute ago' ],
      [ -3 * H, '3 hours ago' ],
      [ -H, 'about an hour ago' ],
      [ -3 * D, '3 days ago' ],
      [ -D, 'about a day ago' ],
      [ -14 * D, '2 weeks ago' ],
      [ -7 * D, 'about a week ago' ],
      [ -90 * D, '3 months ago' ],
      [ -30 * D, 'about a month ago' ],
      [ -800 * D, '2 years ago' ],
      [ -365 * D, 'about a year ago' ],
      [ 500, 'less than a second from now' ],
      [ 30 * S, '30 seconds from now' ],
      [ 60 * S, 'about a minute from now' ],
      [ 3 * H, '3 hours from now' ],
      [ H, 'about an hour from now' ],
      [ 3 * D, '3 days from now' ],
      [ D, 'about a day from now' ],
      [ 14 * D, '2 weeks from now' ],
      [ 7 * D, 'about a week from now' ],
      [ 90 * D, '3 months from now' ],
      [ 30 * D, 'about a month from now' ],
      [ 800 * D, '2 years from now' ],
      [ 365 * D, 'about a year from now' ],
      [ 5 * M, '5 minutes from now' ],
    ])('offset %p -> %s', (offset, expected) => {
      expect(TimeagoFormatter(NOW + offset)).toBe(expected);
    });

    it('accepts date and string inputs', () => {
      expect(TimeagoFormatter(new Date(NOW - 2 * H))).toBe('2 hours ago');
      expect(TimeagoFormatter(new Date(NOW - 2 * H).toISOString())).toBe('2 hours ago');
    });
  });

  it('TimeagoPipe delegates to the formatter', () => {
    expect(new TimeagoPipe().transform(NOW - 3 * H)).toBe('3 hours ago');
  });

  it('TimeagoLivePipe emits immediately and on each tick', () => {
    const values: string[] = [];
    const sub = new TimeagoLivePipe().transform(NOW - 59 * S).subscribe(v => values.push(v));
    expect(values).toEqual([ '59 seconds ago' ]);
    vi.advanceTimersByTime(1000);
    expect(values).toEqual([ '59 seconds ago', 'about a minute ago' ]);
    sub.unsubscribe();
  });

  describe('TimeagoDirective', () => {
    @Component({
      standalone: true,
      imports: [ TimeagoDirective ],
      template: `<span rxapTimeago [date]="date()"></span>`,
    })
    class HostComponent {
      date = signal<number>(NOW - 2 * H);
    }

    it('renders and updates the text content', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const span: HTMLElement = fixture.nativeElement.querySelector('span');
      expect(span.textContent).toBe('2 hours ago');
      fixture.componentInstance.date.set(NOW - 3 * D);
      fixture.detectChanges();
      expect(span.textContent).toBe('3 days ago');
    });

    it('setContent falls back to data for nodes without textContent', () => {
      const fixture = TestBed.createComponent(HostComponent);
      const directive = fixture.debugElement.children[ 0 ]?.injector.get(TimeagoDirective)
        ?? (fixture.detectChanges(), fixture.debugElement.children[ 0 ].injector.get(TimeagoDirective));
      const node: any = { textContent: null };
      directive.setContent(node, 'abc');
      expect(node.data).toBe('abc');
    });
  });
});
