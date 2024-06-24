import { ComponentType } from '@angular/cdk/portal';
import { AppsNavigationConfig } from '@rxap/config';
import { IconConfig } from '@rxap/utilities';



export type ExternalApps = AppsNavigationConfig;
export type ExtractUsernameFromProfileFn<T = unknown> = (profile: T) => string | null;
export interface ReleaseInfoModule {
  name: string;
  version: string;
  hash?: string;
}

export type SettingsMenuItemComponent = ComponentType<unknown>;

export interface SettingsMenuItem {
  icon?: IconConfig;
  label: string;
  action: () => any;
}
