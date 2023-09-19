import { Injectable } from '@angular/core';
import {
  PipeDataSource,
  RxapPipeDataSource,
} from '@rxap/data-source';
import { map } from 'rxjs';
import { SettingsControllerGetResponse } from './responses/settings-controller-get.response';
import { UserSettingsDataSource } from './user-settings.data-source';

@Injectable({ providedIn: 'root' })
@RxapPipeDataSource({
  id: 'user-settings-language',
  refreshParent: true,
})
export class UserSettingsLanguageDataSource<T> extends PipeDataSource<SettingsControllerGetResponse<T>, string> {

  constructor(
    dataSource: UserSettingsDataSource<T>,
  ) {
    super(
      dataSource,
      map((settings) => settings.language),
    );
  }

}
