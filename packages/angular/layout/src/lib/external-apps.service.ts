import {
  inject,
  Injectable,
  LOCALE_ID,
  signal,
} from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ClickOnLink } from '@rxap/browser-utilities';
import { ConfigService } from '@rxap/config';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import {
  coerceArray,
  JoinPath,
} from '@rxap/utilities';
import { RXAP_EXTERNAL_APP_FILTER } from './tokens';
import { ExternalApps } from './types';

@Injectable({ providedIn: 'root' })
export class ExternalAppsService {

  protected readonly appFilterList = coerceArray(inject(RXAP_EXTERNAL_APP_FILTER, { optional: true}));
  protected readonly config = inject(ConfigService);
  protected readonly localeId = inject(LOCALE_ID);
  protected readonly environment = inject(RXAP_ENVIRONMENT);
  protected readonly apps: Array<ExternalApps> = this.config.get('navigation.apps', []);

  /**
   * The list of active apps that is processed by the getAppList method
   */
  public readonly activeAppList = signal<Array<ExternalApps>>([]);

  public hasApp(appId: string): boolean {
    return this.apps.some(app => app.id === appId);
  }

  public getApp(appId: string): ExternalApps | null {
    if (!this.hasApp(appId)) {
      return null;
    }
    const app = this.apps.find(app => app.id === appId);
    if (!app) {
      throw new Error(`FATAL: App with id "${ appId }" not found!`);
    }
    return structuredClone(app);
  }

  public getAppUrl(appId: string, path: string, infix: string | null = this.getPathPrefix()): string | null {

    const app = this.getApp(appId);

    if (!app || !app.href) {
      return null;
    }

    return JoinPath(app.href, infix, path);

  }

  public getAppRouterLink(appId: string, path: string): string[] | null {

    const app = this.getApp(appId);

    if (!app || !app.routerLink) {
      return null;
    }

    return [...app.routerLink, path];
  }

  public getAppUrlOrThrow(appId: string, path: string): string {
    const url = this.getAppUrl(appId, path);
    if (url) {
      return url;
    }
    throw new Error(`Could not find url for app with id "${ appId }"`);
  }

  public getAppRouterLinkOrThrow(appId: string, path: string): string[] {
    const routerLink = this.getAppRouterLink(appId, path);
    if (routerLink) {
      return routerLink;
    }
    throw new Error(`Could not find router link for app with id "${ appId }"`);
  }

  public navigate(appId: string, path: string): void {

    const url = this.getAppUrl(appId, path);

    if (url) {
      ClickOnLink(url);
    }

  }

  public async getAppList(): Promise<Array<ExternalApps>> {
    let appList: ExternalApps[] = this
      .apps
      .filter(app => !app.hidden)
      .map(app => structuredClone(app));

    appList.forEach(app => {
      if (app.href) {
        app.href = JoinPath(app.href, this.getPathPrefix());
      }
    });

    for (const appFilter of this.appFilterList) {
      appList = await appFilter.call(structuredClone(appList));
    }

    appList = structuredClone(appList);
    this.activeAppList.set(appList);
    return appList;
  }

  protected getPathPrefix(): string {
    if (this.environment.production && this.localeId) {
      return this.localeId.replace(/-.+$/, '');
    }
    return '';
  }

}
