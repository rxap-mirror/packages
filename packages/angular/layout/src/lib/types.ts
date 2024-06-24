import { AppsNavigationConfig } from '@rxap/config';



export type ExternalApps = AppsNavigationConfig;
export type ExtractUsernameFromProfileFn<T = unknown> = (profile: T) => string | null;
