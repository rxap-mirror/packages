import { Injectable } from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import { ProfileControllerGetRemoteMethod } from './remote-methods/profile-controller-get.remote-method';
import { ProfileControllerGetResponse } from './responses/profile-controller-get.response';

@Injectable({ providedIn: 'root' })
@RxapDataSource('user-profile')
export class UserProfileDataSource<T = unknown> extends MethodDataSource<ProfileControllerGetResponse<T>> {

  constructor(
    method: ProfileControllerGetRemoteMethod<T>,
  ) {
    super(method, true);
  }

}
