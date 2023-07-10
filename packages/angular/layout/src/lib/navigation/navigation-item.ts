import { IconConfig } from '@rxap/utilities';
import {
  AbstractType,
  InjectionToken,
  Type,
} from '@angular/core';
import { Observable } from 'rxjs';

export type Navigation = Array<NavigationItem | NavigationDividerItem>;

export type NavigationWithInserts = Array<
  | NavigationItem<NavigationWithInserts>
  | NavigationDividerItem
  | NavigationInsertItem
>;

export interface NavigationDividerItem {
  divider: boolean;
  title?: string;
}

export function IsNavigationDividerItem(
  item: any,
): item is NavigationDividerItem {
  return !!item && !!item['divider'];
}

export interface NavigationInsertItem {
  insert: string;
}

export function IsNavigationInsertItem(
  item: any,
): item is NavigationInsertItem {
  return !!item && !!item['insert'];
}

export interface NavigationStatus {
  isVisible(
    navigationItem: NavigationItem,
  ): Observable<boolean> | Promise<boolean> | boolean;
}

export interface NavigationItem<Children = Navigation> extends Record<string, unknown> {
  routerLink: string[];
  label: string;
  children?: Children;
  icon?: IconConfig;
  status?: Array<
    | Type<NavigationStatus>
    | InjectionToken<NavigationStatus>
    | AbstractType<NavigationStatus>
  >;
}

export function IsNavigationItem(item: any): item is NavigationItem {
  return (
    !!item && !!item['routerLink'] && !!item['label']
  );
}
