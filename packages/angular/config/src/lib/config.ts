export interface AppsNavigationConfig {
  target?: string;
  image?: string;
  label: string;
  href?: string;
  routerLink?: string[];
  empty?: false;
  hidden?: boolean;
  id?: string;
  permissions: string[];
}

export interface NavigationConfig {
  apps?: AppsNavigationConfig[];
}

export interface Config {
  navigation?: NavigationConfig;
  collapsable?: boolean;
  pinned?: boolean;
  mode?: 'side' | 'over';
  opened?: boolean;
}
