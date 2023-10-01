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
import { ProfileControllerGetRemoteMethod } from './openapi/remote-methods/profile-controller-get.remote-method';
import { ProfileControllerGetResponse } from './openapi/responses/profile-controller-get.response';

@Injectable({ providedIn: 'root' })
@RxapDataSource('user-profile')
export class UserProfileDataSource<T = unknown> extends MethodDataSource<ProfileControllerGetResponse<T>> {

  protected readonly auth = inject(RxapAuthenticationService);

  protected waitForAuthenticationTimeout = 10000;

  constructor(
    @Inject(ProfileControllerGetRemoteMethod)
    method: ProfileControllerGetRemoteMethod<T>,
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
    return {} as any;
  }

}
