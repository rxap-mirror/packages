import {
  Action,
  IconConfig
} from '@rxap/utilities';

export type Navigation = Array<NavigationItem | NavigationDividerItem>;

export type NavigationWithInserts = Array<NavigationItem<NavigationWithInserts> | NavigationDividerItem | NavigationInsertItem>;

export interface NavigationDividerItem {
  divider: boolean;
  title?: string;
}

export function IsNavigationDividerItem(item: any): item is NavigationDividerItem {
  return item && item.hasOwnProperty('divider') && item.divider;
}

export interface NavigationInsertItem {
  insert: string;
}

export function IsNavigationInsertItem(item: any): item is NavigationInsertItem {
  return item && item.hasOwnProperty('insert');
}

export interface NavigationItem<Children = Navigation> {
  routerLink: string[];
  label: string;
  children?: Children;
  icon?: IconConfig;
}

export function IsNavigationItem(item: any): item is NavigationItem {
  return item && item.hasOwnProperty('routerLink') && item.hasOwnProperty('label');
}
