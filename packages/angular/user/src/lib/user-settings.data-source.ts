import {
  inject,
  Inject,
  Injectable,
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import {
  filter,
  firstValueFrom,
  of,
  timeout,
} from 'rxjs';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerGetResponse } from './openapi/responses/settings-controller-get.response';
import { UserSettingsOfflineService } from './user-settings-offline.service';

@Injectable({ providedIn: 'root' })
@RxapDataSource({
  id: 'user-settings',
  restore: true,
})
export class UserSettingsDataSource<T> extends MethodDataSource<SettingsControllerGetResponse<T>, void> {

  protected readonly auth = inject(RxapAuthenticationService);

  protected readonly offline = inject(UserSettingsOfflineService);

  protected waitForAuthenticationTimeout = 10000;

  constructor(
    @Inject(SettingsControllerGetRemoteMethod)
    method: SettingsControllerGetRemoteMethod<T>,
  ) {
    super(method, true);
  }

  protected waitUntilAuthenticated(): Promise<boolean> {
    return firstValueFrom(this.auth.isAuthenticated$.pipe(
      filter((isAuthenticated): isAuthenticated is boolean => isAuthenticated === true),
      timeout({ each: this.waitForAuthenticationTimeout, with: () => of(false) }),
    ));
  }

  protected override async execute(parameters?: void) {
    if (await this.waitUntilAuthenticated()) {
      return super.execute(parameters);
    }
    return this.offline.get();
  }

}
