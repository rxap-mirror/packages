import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource,
} from '@rxap/data-source';
import { Method } from '@rxap/pattern';
import { RXAP_GET_USER_SETTINGS_METHOD } from './tokens';
import { UserSettings } from './user-settings';

@Injectable({ providedIn: 'root' })
@RxapDataSource('user-settings')
export class UserSettingsDataSource<US extends UserSettings = UserSettings> extends MethodDataSource<US> {

  constructor(
    @Inject(RXAP_GET_USER_SETTINGS_METHOD)
      method: Method<US>,
  ) {
    super(method, true);
  }

}
