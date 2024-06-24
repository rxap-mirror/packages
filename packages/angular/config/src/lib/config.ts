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

export interface LogoConfig {
  src?: string;
  width?: number;
  height?: number;
}

export interface NavigationConfig {
  apps?: AppsNavigationConfig[];
  collapsable?: boolean;
  pinned?: boolean;
  mode?: 'side' | 'over';
  opened?: boolean;
  fixedInViewport?: boolean;
}

export type LanguagesConfig = Record<string, string>;

export interface i18nConfig {
  languages?: LanguagesConfig;
  defaultLanguage?: string;
}

export interface Config {
  navigation?: NavigationConfig;
  logo?: LogoConfig;
  i18n?: i18nConfig;
}
