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
  id: 'user-settings-language',
  refreshParent: true,
})
export class UserSettingsLanguageDataSource extends PipeDataSource<UserSettings, string> {

  constructor(
    dataSource: UserSettingsDataSource,
  ) {
    super(
      dataSource,
      map((settings) => settings.language),
    );
  }

}
