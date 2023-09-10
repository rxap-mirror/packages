import { Injectable } from '@angular/core';
import {
  PipeDataSource,
  RxapPipeDataSource,
} from '@rxap/data-source';
import { map } from 'rxjs';
import { UserSettings } from './user-settings';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
@RxapPipeDataSource({
  id: 'user-settings-dark-mode',
  refreshParent: true,
})
export class UserSettingsDarkModeDataSource extends PipeDataSource<UserSettings, boolean> {

  constructor(
    dataSource: UserSettingsDataSource,
  ) {
    super(
      dataSource,
      map((settings) => settings.darkMode),
    );
  }

}
