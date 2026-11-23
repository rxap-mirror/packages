import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  firstValueFrom,
  Observable,
  throwError,
} from 'rxjs';
import {
  Navigation,
  NavigationItem,
  NavigationStatus,
  NavigationWithInserts,
} from './navigation/navigation-item';
import { NavigationService } from './navigation.service';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS,
} from './tokens';

@Injectable()
class VisibleStatus implements NavigationStatus {
  public isVisible(): boolean {
    return true;
  }
}

@Injectable()
class PromiseStatus implements NavigationStatus {
  public isVisible(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

@Injectable()
class HiddenStatus implements NavigationStatus {
  public isVisible(): boolean {
    return false;
  }
}

@Injectable()
class FailingStatus implements NavigationStatus {
  public isVisible(): Observable<boolean> {
    return throwError(() => new Error('boom'));
  }
}

describe('NavigationService (inserts and status handling)', () => {

  function create(
    navigation: NavigationWithInserts | (() => NavigationWithInserts),
    inserts?: Record<string, NavigationWithInserts>,
  ): NavigationService {
    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: RXAP_NAVIGATION_CONFIG, useValue: navigation },
        ...(inserts ? [ { provide: RXAP_NAVIGATION_CONFIG_INSERTS, useValue: inserts } ] : []),
        VisibleStatus,
        PromiseStatus,
        HiddenStatus,
        FailingStatus,
      ],
    });
    return TestBed.inject(NavigationService);
  }

  const home: NavigationItem = { label: 'Home', routerLink: '/home' };
  const about: NavigationItem = { label: 'About', routerLink: '/about' };

  it('uses the navigation factory function when the config is a function', async () => {
    const service = create(() => [ home ]);
    const nav = await firstValueFrom(service.config$);
    expect(nav).toEqual([ { ...home, children: [] } ]);
  });

  it('replaces an insert item with the content of the registered insert', async () => {
    const service = create([ home, { insert: 'extra' }, { divider: true } ], { extra: [ about ] });
    const nav = await firstValueFrom(service.config$);
    expect(nav).toEqual([
      { ...home, children: [] },
      { ...about, children: [] },
      { divider: true },
    ]);
  });

  it('drops insert placeholders without a registered insert', async () => {
    const service = create([ home, { insert: 'missing' } ]);
    const nav = await firstValueFrom(service.config$);
    expect(nav).toEqual([ { ...home, children: [] } ]);
  });

  it('resolves inserts recursively inside children and inside other inserts', async () => {
    const service = create(
      [ { ...home, children: [ { insert: 'a' } ] } ],
      {
        a: [ { insert: 'b' } ],
        b: [ about ],
      },
    );
    const nav = await firstValueFrom(service.config$);
    expect(nav).toEqual([
      { ...home, children: [ { ...about, children: [] } ] },
    ]);
  });

  it('supports add, has, get and remove and republishes the navigation', async () => {
    const service = create([ home, { insert: 'extra' } ]);
    const emitted: Navigation[] = [];
    const sub = service.config$.subscribe((nav) => emitted.push(nav));

    expect(service.has('extra')).toBe(false);
    expect(service.get('extra')).toBeUndefined();

    service.add('extra', [ about ]);
    expect(service.has('extra')).toBe(true);
    expect(service.get('extra')).toEqual([ about ]);
    expect(emitted.at(-1)).toEqual([
      { ...home, children: [] },
      { ...about, children: [] },
    ]);

    service.remove('extra');
    expect(service.has('extra')).toBe(false);
    expect(emitted.at(-1)).toEqual([ { ...home, children: [] } ]);
    sub.unsubscribe();
  });

  it('does not republish when add or remove is called with update=false', () => {
    const service = create([ home, { insert: 'extra' } ]);
    const emitted: Navigation[] = [];
    const sub = service.config$.subscribe((nav) => emitted.push(nav));
    const count = emitted.length;

    service.add('extra', [ about ], false);
    expect(emitted).toHaveLength(count);
    service.remove('extra', false);
    expect(emitted).toHaveLength(count);
    expect(service.has('extra')).toBe(false);
    sub.unsubscribe();
  });

  it('insert (deprecated) delegates to add', async () => {
    const service = create([ { insert: 'extra' } ]);
    service.insert('extra', [ about ]);
    expect(service.has('extra')).toBe(true);
    const nav = await firstValueFrom(service.config$);
    expect(nav).toEqual([ { ...about, children: [] } ]);
  });

  it('updateNavigation emits the current navigation again', () => {
    const service = create([ home ]);
    const emitted: Navigation[] = [];
    const sub = service.config$.subscribe((nav) => emitted.push(nav));
    const count = emitted.length;
    service.updateNavigation();
    expect(emitted).toHaveLength(count + 1);
    sub.unsubscribe();
  });

  describe('status handling', () => {

    it('keeps an item when all status providers return visible (sync and promise)', async () => {
      const service = create([]);
      const item: NavigationItem = { ...home, status: [ VisibleStatus, PromiseStatus ] };
      const result = await firstValueFrom(service.checkNavigationItemStatusProviders(item));
      expect(result).toEqual(item);
    });

    it('hides an item when one of the status providers returns not visible', async () => {
      const service = create([]);
      const item: NavigationItem = { ...home, status: [ VisibleStatus, HiddenStatus ] };
      const result = await firstValueFrom(service.checkNavigationItemStatusProviders(item));
      expect(result).toBeNull();
    });

    it('hides an item and logs the error when a status provider fails', async () => {
      const service = create([]);
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const item: NavigationItem = { ...home, status: [ FailingStatus ] };
      const result = await firstValueFrom(service.checkNavigationItemStatusProviders(item));
      expect(result).toBeNull();
      expect(error).toHaveBeenCalledWith('isVisible method failed: boom');
      error.mockRestore();
    });

    it('filters the children of a visible item that has a status', async () => {
      const service = create([]);
      const item: NavigationItem = {
        ...home,
        status: [ VisibleStatus ],
        children: [
          { ...about, status: [ HiddenStatus ] },
          { label: 'Other', routerLink: '/other' },
        ],
      };
      const result = await firstValueFrom(service.checkNavigationItemStatusProviders(item));
      expect(result).toEqual({
        ...item,
        children: [ { label: 'Other', routerLink: '/other' } ],
      });
    });

    it('removes hidden items from a whole navigation', async () => {
      const service = create([]);
      const nav = await firstValueFrom(service.checkNavigationStatusProviders([
        home,
        { divider: true },
        { ...about, status: [ HiddenStatus ] },
      ]));
      expect(nav).toEqual([ home, { divider: true } ]);
    });
  });
});
