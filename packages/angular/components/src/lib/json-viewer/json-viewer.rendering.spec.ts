import { TestBed } from '@angular/core/testing';
import { JsonViewerComponent, Segment } from './json-viewer.component';
import { JSON_VIEW_IGNORED_PROPERTIES, JSON_VIEW_IGNORED_TYPES } from './json-viewer.tokens';

describe('JsonViewerComponent rendering', () => {
  function create(json: object, expanded = false) {
    const fixture = TestBed.createComponent(JsonViewerComponent);
    fixture.componentRef.setInput('json', json);
    fixture.componentRef.setInput('expanded', expanded);
    fixture.detectChanges();
    return fixture;
  }

  const segmentOf = (f: ReturnType<typeof create>, key: string) =>
    f.componentInstance.segments().find((s) => s.key === key) as Segment;

  it('builds segments with types and descriptions', () => {
    const f = create({
      n: 1,
      b: true,
      s: 'x',
      nul: null,
      u: undefined,
      arr: [1, 2],
      obj: { a: 1 },
      date: new Date(0),
      fn: () => 1,
    });
    expect(segmentOf(f, 'n').type).toBe('number');
    expect(segmentOf(f, 'b').type).toBe('boolean');
    expect(segmentOf(f, 's')).toMatchObject({ type: 'string', description: '"x"' });
    expect(segmentOf(f, 'nul')).toMatchObject({ type: 'null', description: 'null' });
    expect(segmentOf(f, 'arr')).toMatchObject({ type: 'array', description: 'Array[2] [1,2]' });
    expect(segmentOf(f, 'obj')).toMatchObject({ type: 'object', description: 'Object {"a":1}' });
  });

  it('classifies date and function values when segments are built directly', () => {
    // cleanObject turns dates into plain objects and drops nothing else, so date and function
    // values can only reach parseKeyValue through the public buildSegments method
    const f = create({});
    const date = new Date(0);
    const fn = () => 1;
    f.componentInstance.buildSegments({ date, fn });
    expect(segmentOf(f, 'date')).toMatchObject({ type: 'date', value: date, description: '' + date });
    expect(segmentOf(f, 'fn')).toMatchObject({ type: 'function', value: fn });
    expect(f.componentInstance.isExpandable(segmentOf(f, 'date'))).toBe(false);
    expect(f.componentInstance.isExpandable(segmentOf(f, 'fn'))).toBe(false);
  });

  it('wraps primitive inspect values', () => {
    const f = create({});
    f.componentInstance.buildSegments(5);
    expect(f.componentInstance.segments()[0]).toMatchObject({ key: '(number)', type: 'number' });
  });

  it('toggles expandable segments only', () => {
    const f = create({ obj: { a: 1 }, n: 1 });
    const c = f.componentInstance;
    const obj = segmentOf(f, 'obj');
    expect(c.isExpandable(obj)).toBe(true);
    c.toggle(obj);
    f.detectChanges();
    expect(segmentOf(f, 'obj').expanded).toBe(true);
    expect(f.nativeElement.querySelectorAll('rxap-json-viewer').length).toBe(1);
    const n = segmentOf(f, 'n');
    c.toggle(n);
    expect(n.expanded).toBe(false);
  });

  it('renders nested viewers when expanded by default', () => {
    const f = create({ obj: { inner: { deep: 1 } } }, true);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('rxap-json-viewer').length).toBeGreaterThan(0);
  });

  it('re-inspects when the json input changes', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const f = create({ a: 1 });
    f.componentRef.setInput('json', { b: 2 });
    f.detectChanges();
    expect(f.componentInstance.segments().map((s) => s.key)).toEqual(['b']);
  });

  it('click on a segment toggles it', () => {
    const f = create({ obj: { a: 1 } });
    f.nativeElement.querySelector('.segment-main').click();
    f.detectChanges();
    expect(segmentOf(f, 'obj').expanded).toBe(true);
  });

  it('warns for non-object input', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const f = create({});
    f.componentInstance.setInspectValue('x');
    expect(warn).toHaveBeenCalled();
  });

  it('flattens nested ignore lists from the tokens', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: JSON_VIEW_IGNORED_PROPERTIES, useValue: ['a', ['b', [/c$/]]] },
        { provide: JSON_VIEW_IGNORED_TYPES, useValue: [[Map], Set] },
      ],
    });
    const c = TestBed.createComponent(JsonViewerComponent).componentInstance;
    expect(c.ignoredProperties.length).toBe(3);
    expect(c.ignoredTypes).toEqual([Map, Set]);
    expect(c.cleanObject({ a: 1, b: 1, xc: 1, keep: 1, m: new Map() })).toEqual({ keep: 1 });
  });
});
