import type { Injector } from '@angular/core';
import {
  Injectable,
  Inject,
  Optional,
  INJECTOR
} from '@angular/core';
import {
  Observable,
  ReplaySubject,
  of,
  combineLatest,
  from
} from 'rxjs';
import {
  Navigation,
  NavigationWithInserts,
  IsNavigationInsertItem,
  IsNavigationItem,
  IsNavigationDividerItem,
  NavigationItem,
  NavigationDividerItem
} from './navigation-item';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS
} from '../tokens';
import {
  switchMap,
  map,
  catchError
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public readonly config$: Observable<Navigation>;

  private inserts = new Map<string, NavigationWithInserts>();

  private readonly navigation: NavigationWithInserts;

  private readonly navigation$ = new ReplaySubject<Navigation>(1);

  constructor(
    @Inject(RXAP_NAVIGATION_CONFIG)
    navigation: any,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Optional()
    @Inject(RXAP_NAVIGATION_CONFIG_INSERTS)
    inserts: any | null = null
  ) {
    if (typeof navigation === 'function') {
      this.navigation = navigation();
    } else {
      this.navigation = navigation;
    }
    if (inserts) {
      Object.entries(inserts).forEach(([id, insert]: [string, any]) =>
        this.insert(id, insert, false)
      );
    }
    this.updateNavigation();
    this.config$ = this.navigation$.pipe(
      switchMap((navigationWithoutStatusCheck) =>
        this.checkNavigationStatusProviders(navigationWithoutStatusCheck)
      )
    );
  }

  /**
   * @deprecated use add instead
   * @param id
   * @param value
   * @param update
   */
  public insert(
    id: string,
    value: NavigationWithInserts,
    update: boolean = true
  ): void {
    this.add(id, value, update);
  }

  public add(
    id: string,
    value: NavigationWithInserts,
    update: boolean = true
  ): void {
    this.inserts.set(id, value);
    if (update) {
      this.updateNavigation();
    }
  }

  public has(id: string): boolean {
    return this.inserts.has(id);
  }

  public get(id: string): NavigationWithInserts | undefined {
    return this.inserts.get(id);
  }

  public remove(id: string, update: boolean = true): void {
    this.inserts.delete(id);
    if (update) {
      this.updateNavigation();
    }
  }

  public updateNavigation(): void {
    this.navigation$.next(this.replaceInserts(this.navigation));
  }

  /**
   * @internal
   * @param navigationItem
   */
  public checkNavigationItemStatusProviders(
    navigationItem: NavigationItem | NavigationDividerItem
  ): Observable<NavigationItem | NavigationDividerItem | null> {
    if (IsNavigationDividerItem(navigationItem) || !navigationItem.status) {
      return of(navigationItem);
    }
    const isVisibleArray$: Array<Observable<boolean>> = navigationItem.status
      .map((statusToken) => this.injector.get(statusToken))
      .map((status) => {
        const isVisible = status.isVisible(navigationItem);
        if (typeof isVisible === 'boolean') {
          return of(isVisible);
        } else {
          return from(isVisible);
        }
      }).map(isVisible$ => isVisible$.pipe(catchError(e => {
        console.error('isVisible method failed: ' + e.message);
        return of(false);
      })));
    // TODO : dont wait for all status services to complete, but cancel waiting if one returns false
    return combineLatest(isVisibleArray$).pipe(
      map((isVisibleArray) =>
        isVisibleArray.reduce((acc, isVisible) => acc && isVisible, true)
      ),
      map((isVisible) => (isVisible ? navigationItem : null)),
      switchMap((navigationItemOrNull) => {
        if (navigationItemOrNull) {
          if (navigationItemOrNull.children?.length) {
            return this.checkNavigationStatusProviders(
              navigationItemOrNull.children
            ).pipe(
              map((children) => ({
                ...navigationItemOrNull,
                children,
              }))
            );
          }
          return of(navigationItemOrNull);
        }
        return of(null);
      })
    );
  }

  /**
   * @internal
   * @param navigationItem
   */
  public checkNavigationStatusProviders(
    navigation: Navigation
  ): Observable<Navigation> {
    return combineLatest(
      navigation.map((navigationItem) =>
        this.checkNavigationItemStatusProviders(navigationItem)
      )
    ).pipe(
      map((navigationWithNullItems) => {
        const cleanNavigation: Navigation = [];

        for (const navigationItem of navigationWithNullItems) {
          if (navigationItem !== null) {
            cleanNavigation.push(navigationItem);
          }
        }

        return cleanNavigation;
      })
    );
  }

  private replaceInserts(
    navigationWithInserts: NavigationWithInserts
  ): Navigation {
    const navigation: Navigation = [];

    for (const navigationItem of navigationWithInserts) {
      if (IsNavigationInsertItem(navigationItem)) {
        if (this.inserts.has(navigationItem.insert)) {
          navigation.push(
            ...this.replaceInserts(this.inserts.get(navigationItem.insert)!)
          );
        }
      } else if (IsNavigationItem(navigationItem)) {
        navigation.push({
          ...navigationItem,
          children: this.replaceInserts(navigationItem.children ?? []),
        });
      } else if (IsNavigationDividerItem(navigationItem)) {
        navigation.push(navigationItem);
      }
    }

    return navigation;
  }
}
