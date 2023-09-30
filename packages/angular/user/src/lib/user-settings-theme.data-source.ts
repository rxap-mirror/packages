import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  PipeDataSource,
  RxapPipeDataSource,
} from '@rxap/data-source';
import { map } from 'rxjs';
import { SettingsControllerGetResponse } from './openapi/responses/settings-controller-get.response';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
@RxapPipeDataSource({
  id: 'user-settings-theme',
  refreshParent: true,
})
export class UserSettingsThemeDataSource<T = unknown>
  extends PipeDataSource<SettingsControllerGetResponse<T>, SettingsControllerGetResponse<T>['theme']> {

  constructor(
    @Inject(UserSettingsDataSource)
    dataSource: UserSettingsDataSource<T>,
  ) {
    super(
      dataSource,
      map((settings) => settings.theme),
    );
  }

}
