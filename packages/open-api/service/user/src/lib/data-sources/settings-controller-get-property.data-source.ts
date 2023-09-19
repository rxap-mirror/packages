import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { SettingsControllerGetPropertyParameter } from '../parameters/settings-controller-get-property.parameter';
import { SettingsControllerGetPropertyResponse } from '../responses/settings-controller-get-property.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('SettingsController_getProperty')
export class SettingsControllerGetPropertyDataSource
  extends OpenApiDataSource<SettingsControllerGetPropertyResponse, SettingsControllerGetPropertyParameter> {
}
