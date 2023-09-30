import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import { ProfileControllerGetRemoteMethod } from './openapi/remote-methods/profile-controller-get.remote-method';
import { ProfileControllerGetResponse } from './openapi/responses/profile-controller-get.response';

@Injectable({ providedIn: 'root' })
@RxapDataSource('user-profile')
export class UserProfileDataSource<T = unknown> extends MethodDataSource<ProfileControllerGetResponse<T>> {

  constructor(
    @Inject(ProfileControllerGetRemoteMethod)
    method: ProfileControllerGetRemoteMethod<T>,
  ) {
    super(method, true);
  }

}
