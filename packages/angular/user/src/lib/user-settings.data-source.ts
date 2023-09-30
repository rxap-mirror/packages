import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerGetResponse } from './openapi/responses/settings-controller-get.response';

@Injectable({ providedIn: 'root' })
@RxapDataSource({
  id: 'user-settings',
  restore: true,
})
export class UserSettingsDataSource<T> extends MethodDataSource<SettingsControllerGetResponse<T>> {

  constructor(
    @Inject(SettingsControllerGetRemoteMethod)
    method: SettingsControllerGetRemoteMethod<T>,
  ) {
    super(method, true);
  }

}
