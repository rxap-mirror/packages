import { Injectable } from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerGetResponse } from './openapi/responses/settings-controller-get.response';

@Injectable({ providedIn: 'root' })
@RxapDataSource('user-settings')
export class UserSettingsDataSource<T> extends MethodDataSource<SettingsControllerGetResponse<T>> {

  constructor(
    method: SettingsControllerGetRemoteMethod<T>,
  ) {
    super(method, true);
  }

}
