import { TestBed } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { AvatarImageService } from './avatar-image.service';
import { LoadingIndicatorService } from './loading-indicator.service';
import { ResetService } from './reset.service';
import {
  ContainerComponent,
  WindowContainerSidenavService,
} from './window-container-sidenav.service';
import { ImageLoaderService } from './image-loader.service';
import { Subject } from 'rxjs';

describe('AvatarImageService', () => {
  it('builds the avatar url with an encoded name', () => {
    const service = TestBed.inject(AvatarImageService);
    expect(service.get({ name: 'John Doe' })).toBe('https://eu.ui-avatars.com/api?name=John%20Doe');
  });
});

describe('ResetService', () => {
  it('resetView and resetDataSource emit on their own subjects', () => {
    const service = TestBed.inject(ResetService);
    const view = vi.fn();
    const ds = vi.fn();
    service.view$.subscribe(view);
    service.dataSource$.subscribe(ds);
    service.resetView();
    expect(view).toHaveBeenCalledTimes(1);
    expect(ds).not.toHaveBeenCalled();
    service.resetDataSource();
    expect(ds).toHaveBeenCalledTimes(1);
  });

  it('resetAll resets data source before view', () => {
    const service = TestBed.inject(ResetService);
    const order: string[] = [];
    service.view$.subscribe(() => order.push('view'));
    service.dataSource$.subscribe(() => order.push('ds'));
    service.resetAll();
    expect(order).toEqual(['ds', 'view']);
  });
});

describe('WindowContainerSidenavService', () => {
  @Component({ selector: 'rxap-x', template: '' })
  class XComponent {}

  const a: ContainerComponent = { id: 'a', component: XComponent };
  const b: ContainerComponent = { id: 'b', component: XComponent };
  let service: WindowContainerSidenavService;
  let added: ContainerComponent[];
  let removed: ContainerComponent[];

  beforeEach(() => {
    service = TestBed.inject(WindowContainerSidenavService);
    added = [];
    removed = [];
    service.add$.subscribe(c => added.push(c));
    service.remove$.subscribe(c => removed.push(c));
  });

  it('adds components and lists them', () => {
    service.add(a);
    service.add(b);
    expect(added).toEqual([a, b]);
    expect(service.getAll()).toEqual([a, b]);
  });

  it('replaces a component with the same id and announces the removal', () => {
    const a2 = { ...a, injector: Injector.create({ providers: [] }) };
    service.add(a);
    service.add(a2);
    expect(removed).toEqual([a]);
    expect(service.getAll()).toEqual([a2]);
  });

  it('removes by id or by instance', () => {
    service.add(a);
    service.add(b);
    service.remove('a');
    service.remove(b);
    expect(removed).toEqual([a, b]);
    expect(service.getAll()).toEqual([]);
  });

  it('ignores removal of unknown components', () => {
    service.remove('nope');
    expect(removed).toEqual([]);
  });
});

describe('LoadingIndicatorService', () => {
  let service: LoadingIndicatorService;
  let values: boolean[];

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [LoadingIndicatorService] });
    service = TestBed.inject(LoadingIndicatorService);
    values = [];
    service.isLoading$.subscribe(v => values.push(v));
  });

  afterEach(() => vi.useRealTimers());

  it('starts enabled', () => {
    expect(values).toEqual([true]);
  });

  it('disable and enable toggle on the next tick', () => {
    service.disable();
    expect(values).toEqual([true]);
    vi.advanceTimersByTime(0);
    expect(values).toEqual([true, false]);
    service.enable();
    vi.advanceTimersByTime(0);
    expect(values).toEqual([true, false, true]);
  });

  it('attachLoading maps truthiness to the loading state', () => {
    const source = new Subject<unknown>();
    service.attachLoading(source);
    source.next(0);
    vi.advanceTimersByTime(0);
    expect(values[values.length - 1]).toBe(false);
    source.next('x');
    vi.advanceTimersByTime(0);
    expect(values[values.length - 1]).toBe(true);
  });

  it('stops following attached sources after destroy', () => {
    const source = new Subject<unknown>();
    service.attachLoading(source);
    service.ngOnDestroy();
    source.next(0);
    vi.advanceTimersByTime(0);
    expect(values).toEqual([true]);
  });
});

describe('ImageLoaderService', () => {
  let instances: Array<{ src: string; onload?: () => void; onerror?: (e?: unknown) => void }>;
  const OriginalImage = globalThis.Image;

  beforeEach(() => {
    instances = [];
    (globalThis as any).Image = class {
      src = '';
      onload?: () => void;
      onerror?: (e?: unknown) => void;
      constructor() {
        instances.push(this);
      }
    };
  });

  afterEach(() => {
    globalThis.Image = OriginalImage;
  });

  it('resolves on load and caches the result', async () => {
    const service = TestBed.inject(ImageLoaderService);
    const p = service.load('a.png');
    expect(instances[0].src).toBe('a.png');
    instances[0].onload!();
    await p;
    await service.load('a.png');
    expect(instances).toHaveLength(1);
  });

  it('shares a pending load', async () => {
    const service = TestBed.inject(ImageLoaderService);
    const p1 = service.load('a.png');
    const p2 = service.load('a.png');
    expect(p1).toBe(p2);
    expect(instances).toHaveLength(1);
    instances[0].onload!();
    await p1;
  });

  it('rejects on error and allows a retry', async () => {
    const service = TestBed.inject(ImageLoaderService);
    const p = service.load('bad.png');
    instances[0].onerror!('fail');
    await expect(p).rejects.toBe('fail');
    const retry = service.load('bad.png');
    expect(instances).toHaveLength(2);
    instances[1].onload!();
    await retry;
  });
});
