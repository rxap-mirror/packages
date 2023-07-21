import {
  Inject,
  Injectable,
  LOCALE_ID,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { JoinPath } from '@rxap/utilities';
import { ClickOnLink } from '@rxap/browser-utilities';
import { RxapUserProfileService } from '@rxap/authentication';

export interface ExternalApps {
  image?: string;
  label: string;
  href: string;
  empty?: false;
  hidden?: boolean;
  id?: string;
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AppUrlService {

  private _apps: Array<ExternalApps>;

  constructor(
    private readonly config: ConfigService,
    @Inject(LOCALE_ID)
    private readonly localeId: string,
    private readonly userProfileService: RxapUserProfileService,
  ) {
    this._apps = this.config.get('navigation.apps') ?? [];
  }

  public getApp(appId: string): ExternalApps | null {
    return this._apps.find(app => app.id === appId) ?? null;
  }

  public getAppUrl(appId: string, path: string): string | null {

    const app = this.getApp(appId);

    if (app) {
      const prefix = this.getPathPrefix();
      return JoinPath(app.href, prefix, path);
    }

    return null;

  }

  public navigate(appId: string, path: string): void {

    const url = this.getAppUrl(appId, path);

    if (url) {
      ClickOnLink(url);
    }

  }

  public async getAppList(): Promise<Array<ExternalApps>> {
    const roles = await this.userProfileService.getRoleList();
    return this._apps.filter(app => !app.hidden)
               .map(app => ({
                 ...app,
                 href: JoinPath(app.href, this.getPathPrefix()),
               }))
               .filter(app => !app.permissions ||
                 !app.permissions.length ||
                 app.permissions.every(permission => roles.includes(permission)));
  }

  private getPathPrefix(): string {
    switch (this.localeId) {

      case 'de-DE':
        return 'de';

      case 'en-US':
        return 'en';

      default:
        return 'de';

    }
  }

}
