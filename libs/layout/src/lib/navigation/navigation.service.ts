import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Navigation,
  NavigationWithInserts,
  IsNavigationInsertItem,
  IsNavigationItem,
  IsNavigationDividerItem
} from './navigation-item';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS
} from '../tokens';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  public config$ = new BehaviorSubject<Navigation>([]);

  private inserts = new Map<string, NavigationWithInserts>();

  private readonly navigation: NavigationWithInserts

  constructor(
    @Inject(RXAP_NAVIGATION_CONFIG)
    navigation: any,
    @Optional()
    @Inject(RXAP_NAVIGATION_CONFIG_INSERTS)
    inserts: any | null = null,
  ) {
    if (typeof navigation === 'function') {
      this.navigation = navigation();
    } else {
      this.navigation = navigation;
    }
    if (inserts) {
      Object
        .entries(inserts)
        .forEach(([id, insert]: [string, any]) =>
          this.insert(id, insert, false)
        );
    }
    this.updateNavigation();
  }

  /**
   * @deprecated use add instead
   * @param id
   * @param value
   * @param update
   */
  public insert(id: string, value: NavigationWithInserts, update: boolean = true): void {
    this.add(id, value, update);
  }

  public add(id: string, value: NavigationWithInserts, update: boolean = true): void {
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
    this.config$.next(this.replaceInserts(this.navigation));
  }

  private replaceInserts(navigationWithInserts: NavigationWithInserts): Navigation {
    const navigation: Navigation = [];

    for (const navigationItem of navigationWithInserts) {

      if (IsNavigationInsertItem(navigationItem)) {
        if (this.inserts.has(navigationItem.insert)) {
          navigation.push(...this.replaceInserts(this.inserts.get(navigationItem.insert)!));
        }
      } else if (IsNavigationItem(navigationItem)) {
        navigation.push({
          ...navigationItem,
          children: this.replaceInserts(navigationItem.children ?? [])
        });
      } else if (IsNavigationDividerItem(navigationItem)) {
        navigation.push(navigationItem);
      }

    }

    return navigation;

  }

}
