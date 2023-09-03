import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ConfigurationControllerGetLatestParameter } from '../parameters/configuration-controller-get-latest.parameter';
import { ConfigurationControllerGetLatestResponse } from '../responses/configuration-controller-get-latest.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ConfigurationController_getLatest')
export class ConfigurationControllerGetLatestDataSource
  extends OpenApiDataSource<ConfigurationControllerGetLatestResponse, ConfigurationControllerGetLatestParameter> {
}
