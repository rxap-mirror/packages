import { AppsNavigationConfig } from '@rxap/config';

export interface LogoConfig {
  src?: string;
  width?: number;
  height?: number;
}

export type ExternalApps = AppsNavigationConfig;
export type ExtractUsernameFromProfileFn<T = unknown> = (profile: T) => string | null;
